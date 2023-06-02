import type { IDecisionMaker } from "common/decision-maker/types";
import { CreditRating, PlayerId, PlayerState, SerializablePlayerState } from "common/state/types";
import type { RuntimeConfig } from "common/config/types";
import type { LoanId, LoanQuote, TransferLoanQuote } from "common/loan/types";
import { IGame } from "common/game/types";
import { PropertyQuote } from "common/property/types";
import {
  EventType,
  LoanCreationEvent,
  LoanTransferEvent,
  PropertyTransferEvent,
  PayBankReason,
  PayBankEvent,
} from "common/events/types";
import { createLoanFromQuote } from "common/loan";
import { assertIsDefined, validateNumberIsNotNaN } from "common/util";
import { PositionType } from "common/board/types";

export class PlayerBase {
  protected game!: IGame;
  constructor(
    protected config: RuntimeConfig,
    protected decisionMaker: IDecisionMaker,
    private _id: PlayerId,
    protected state: PlayerState
  ) {}
  getState(): SerializablePlayerState {
    const { creditLoans, debtLoans, properties, ...rest } = this.state;
    return {
      ...rest,
      creditLoans: Array.from(creditLoans),
      debtLoans: Array.from(debtLoans),
      properties: Array.from(properties),
    };
  }
  public get type() {
    return this.state.type;
  }
  public get emoji() {
    return this.state.emoji;
  }
  public get riskiness() {
    return this.state.riskiness;
  }
  public get id(): PlayerId {
    return this._id;
  }
  public get creditRating(): CreditRating {
    return this.state.creditRating;
  }
  public get inJail(): boolean {
    return this.state.inJail;
  }
  public get inJailSince(): number | null {
    return this.state.inJailSince;
  }
  public get position(): number {
    return this.state.position;
  }
  public get mostRecentRoll(): [number, number] | null {
    return this.state.mostRecentRoll;
  }
  public get creditRatingLendingThreshold(): CreditRating {
    return this.state.creditRatingLendingThreshold;
  }
  public get cashOnHand(): number {
    return this.state.cashOnHand;
  }
  public get getOutOfJailFreeCards(): number {
    return this.state.getOutOfJailFreeCards;
  }
  public get properties(): Set<number> {
    return this.state.properties;
  }
  public get creditLoans(): Set<LoanId> {
    return this.state.creditLoans;
  }
  public get debtLoans(): Set<LoanId> {
    return this.state.debtLoans;
  }
  setMostRecentRoll(roll: [number, number]): void {
    this.state.mostRecentRoll = roll;
  }
  setPosition(position: number): void {
    console.log(`setting position of ${this.id} to ${position}`);
    this.state.position = position;
  }
  getOutOfJail(): void {
    this.state.inJail = false;
    this.state.inJailSince = null;
  }
  goToJail(turn: number): void {
    this.state.inJail = true;
    this.state.inJailSince = turn;
    const jailPosition = this.game.state.board.positions.find(p => p.type === PositionType.Jail);
    assertIsDefined(jailPosition, "no jail position found");
    this.state.position = jailPosition.position;
  }
  addCash(amount: number): void {
    this.state.cashOnHand += amount;
    validateNumberIsNotNaN(
      this.state.cashOnHand,
      `${this.id} cashOnHand is invalid; tried to add ${amount}`
    );
  }
  subtractCash(amount: number): void {
    this.state.cashOnHand -= amount;
    validateNumberIsNotNaN(
      this.state.cashOnHand,
      `${this.id} cashOnHand is invalid; tried to subtract ${amount}`
    );
  }
  addCreditLoan(id: LoanId): void {
    this.state.creditLoans.add(id);
  }
  removeCreditLoan(id: LoanId): void {
    this.state.creditLoans.delete(id);
  }
  addDebtLoan(id: LoanId): void {
    this.state.debtLoans.add(id);
  }
  removeDebtLoan(id: LoanId): void {
    this.state.debtLoans.delete(id);
  }
  addProperty(id: number): void {
    this.state.properties.add(id);
  }
  removeProperty(id: number): void {
    this.state.properties.delete(id);
  }
  async handleFinanceOption(amount: number, reason: string): Promise<void> {
    const loanQuote = await this.decisionMaker.decideHowToFinancePayment(amount, reason);
    if (!loanQuote) {
      return;
    }
    this.game.createLoan(loanQuote);
  }
  purchaseProperty(quote: PropertyQuote): void {
    if (quote.for !== this.id) {
      throw new Error(`Cannot purchase ${quote.propertyId} when the quote is not for you`);
    }
    const event: Omit<PropertyTransferEvent, "turn" | "order"> = {
      type: EventType.PropertyTransfer,
      amount: quote.offer,
      from: quote.owner,
      to: quote.for,
      propertyId: quote.propertyId,
      propertyType: quote.propertyType,
    };
    this.game.processEvent(event);
  }
  sellProperty(quote: PropertyQuote): void {
    if (quote.owner !== this.id) {
      throw new Error(`Cannot sell ${quote.propertyId} when you don't own it`);
    }
    // TODO: sell improvements to property and other properties of the same color to the bank if necessary

    const event: Omit<PropertyTransferEvent, "turn" | "order"> = {
      type: EventType.PropertyTransfer,
      amount: quote.offer,
      from: quote.owner,
      to: quote.for,
      propertyId: quote.propertyId,
      propertyType: quote.propertyType,
    };
    this.game.processEvent(event);
  }
  takeOutLoan(quote: LoanQuote): void {
    if (quote.debtor !== this.id) {
      throw new Error(`Cannot take out loan because the quote is not for you`);
    }
    const event: Omit<LoanCreationEvent, "turn" | "order"> = {
      type: EventType.LoanCreation,
      loan: createLoanFromQuote(quote),
    };
    this.game.processEvent(event);
  }
  makeLoanToOtherPlayer(quote: LoanQuote): void {
    if (quote.creditor !== this.id) {
      throw new Error(`Cannot lend to player because the quote is not for you`);
    }
    const event: Omit<LoanCreationEvent, "turn" | "order"> = {
      type: EventType.LoanCreation,
      loan: createLoanFromQuote(quote),
    };
    this.game.processEvent(event);
  }
  protected recalculateCreditRating() {
    // TODO: implement
    this.state.creditRating = CreditRating.A;
  }
  protected recalculateCreditRatingLendingThreshold() {
    // TODO: implement
    this.state.creditRatingLendingThreshold = CreditRating.C;
  }
  public getNetWorth(): number {
    const totalAssetValue = this.getTotalAssetValue();
    const totalLiabilityValue = this.getTotalLiabilityValue();
    const netWorth = totalAssetValue - totalLiabilityValue;
    this.state.netWorth = netWorth;
    return netWorth;
  }
  public recalculateValues(): void {
    console.log(`Recalculating values for ${this.id}...`);
    this.recalculateCreditRating();
    this.recalculateCreditRatingLendingThreshold();
    this.getNetWorth();
  }
  public getTotalAssetValue(): number {
    let value = this.state.cashOnHand;
    this.state.properties.forEach(id => {
      const property = this.game.state.propertyStore.get(id);
      value += property.marketValue;
    });
    this.state.creditLoans.forEach(id => {
      const loan = this.game.state.loanStore.get(id);
      const loanFaceValue = loan.getFaceValue();
      value += loanFaceValue;
    });
    return value;
  }
  public getTotalLiabilityValue(): number {
    let value = 0;
    this.state.debtLoans.forEach(id => {
      const loan = this.game.state.loanStore.get(id);
      const remainingBalance = loan.getCurrentBalance();
      value += remainingBalance;
    });
    return value;
  }
  async getLoanQuotesFromOtherPlayers(amount: number): Promise<LoanQuote[]> {
    const players = this.game.state.playerTurnOrder.map(playerId =>
      this.game.state.playerStore.get(playerId)
    );
    const quotes: LoanQuote[] = [];
    for await (const player of players) {
      const offer = await player.getLoanQuoteForPlayer(this.id, amount);
      if (offer) {
        console.log(`Got loan offer from ${player.id}`);
        quotes.push(offer);
      } else {
        console.log(`${player.id} declined to offer a loan`);
      }
    }
    return quotes;
  }
  async getSellPropertyQuotesFromOtherPlayers(
    propertyId: number,
    price: number
  ): Promise<PropertyQuote[]> {
    const players = this.game.state.playerTurnOrder.map(playerId =>
      this.game.state.playerStore.get(playerId)
    );
    const property = this.game.state.propertyStore.get(propertyId);
    const quotes: PropertyQuote[] = [];
    for await (const player of players) {
      const quote: PropertyQuote = {
        ...property,
        offer: price,
        for: player.id,
      };
      const wouldAccept = await player.decideToAcceptPropertyQuote(quote);
      if (wouldAccept) {
        quotes.push(quote);
      }
    }
    return quotes;
  }
  async getLoanQuoteForPlayer(playerId: PlayerId, amount: number): Promise<LoanQuote | null> {
    return this.decisionMaker.getLoanQuoteForPlayer(playerId, amount);
  }
  async getPurchasePropertyQuoteForPlayer(
    playerId: PlayerId,
    propertyId: number
  ): Promise<PropertyQuote | null> {
    return this.decisionMaker.getPurchasePropertyQuoteForPlayer(playerId, propertyId);
  }
  async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
    return this.decisionMaker.decideToAcceptPropertyQuote(quote);
  }
  payCashToBank(amount: number, reason: PayBankReason) {
    const event: Omit<PayBankEvent, "turn" | "order"> = {
      type: EventType.PayBank,
      reason,
      player: this.id,
      amount,
    };
    this.game.processEvent(event);
  }
  async decideToUseGetOutOfJailFreeCard(): Promise<boolean> {
    return this.decisionMaker.decideToUseGetOutOfJailFreeCard();
  }
  async decideToPayToGetOutOfJail(): Promise<boolean> {
    return this.decisionMaker.decideToPayToGetOutOfJail();
  }
  async decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean> {
    return this.decisionMaker.decideToAcceptTransferLoanQuote(quote);
  }
  async getTransferLoanOffersFromOtherPlayers(
    loanId: LoanId,
    price: number
  ): Promise<TransferLoanQuote[]> {
    const players = this.game.state.playerTurnOrder.map(playerId =>
      this.game.state.playerStore.get(playerId)
    );
    const loan = this.game.state.loanStore.get(loanId);
    const quotes: TransferLoanQuote[] = [];
    for await (const player of players) {
      const quote: TransferLoanQuote = {
        amount: loan.getCurrentBalance(),
        creditor: loan.creditor,
        debtor: loan.debtor,
        loanId,
        rate: loan.rate,
        rateType: loan.rateType,
        term: loan.term,
        offer: price,
        for: player.id,
      };
      const wouldAccept = await player.decideToAcceptTransferLoanQuote(quote);
      if (wouldAccept) {
        quotes.push(quote);
      }
    }
    return quotes;
  }
  sellLoan(quote: TransferLoanQuote): void {
    const transferLoanEvent: Omit<LoanTransferEvent, "turn" | "order"> = {
      amount: quote.offer,
      loanId: quote.loanId,
      newCreditor: quote.for,
      originalCreditor: quote.creditor,
      type: EventType.LoanTransfer,
    };
    this.game.processEvent(transferLoanEvent);
  }
}
