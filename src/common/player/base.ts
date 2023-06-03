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
import { createLoanStateFromQuote } from "common/loan";
import { assertIsDefined, validateNumberIsNotNaN } from "common/util";
import { PositionType } from "common/board/types";
import {
  calculateExpectedRentForProperty,
  calculateExpectedReturnOnPropertyPerTurn,
} from "common/events/util";
import { calculateCreditRating } from "common/decision-maker/util";

export class PlayerBase {
  protected game!: IGame;
  constructor(
    protected config: RuntimeConfig,
    protected decisionMaker: IDecisionMaker,
    private _id: PlayerId,
    protected state: PlayerState
  ) {
    this.state.creditLoans = new Set(Array.from(this.state.creditLoans));
    this.state.debtLoans = new Set(Array.from(this.state.debtLoans));
    this.state.properties = new Set(Array.from(this.state.properties));
  }
  getState(): SerializablePlayerState {
    const { creditLoans, debtLoans, properties, ...rest } = this.state;
    return {
      ...rest,
      creditLoans: Array.from(creditLoans),
      debtLoans: Array.from(debtLoans),
      properties: Array.from(properties),
    };
  }
  protected get isRegistered() {
    return !!this.game;
  }
  public get creditLimit() {
    return this.state.creditLimit;
  }
  public get isBankrupt() {
    return this.state.isBankrupt;
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
    this.recalculateValues();
  }
  subtractCash(amount: number): void {
    this.state.cashOnHand -= amount;
    validateNumberIsNotNaN(
      this.state.cashOnHand,
      `${this.id} cashOnHand is invalid; tried to subtract ${amount}`
    );
    this.recalculateValues();
  }
  addCreditLoan(id: LoanId): void {
    this.state.creditLoans.add(id);
    this.recalculateValues();
  }
  removeCreditLoan(id: LoanId): void {
    this.state.creditLoans.delete(id);
    this.recalculateValues();
  }
  addDebtLoan(id: LoanId): void {
    this.state.debtLoans.add(id);
    this.recalculateValues();
  }
  removeDebtLoan(id: LoanId): void {
    this.state.debtLoans.delete(id);
    this.recalculateValues();
  }
  addProperty(id: number): void {
    this.state.properties.add(id);
    this.recalculateValues();
  }
  removeProperty(id: number): void {
    this.state.properties.delete(id);
    this.recalculateValues();
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
      loan: createLoanStateFromQuote(quote),
    };
    this.game.processEvent(event);
  }
  makeLoanToOtherPlayer(quote: LoanQuote): void {
    if (quote.creditor !== this.id) {
      throw new Error(`Cannot lend to player because the quote is not for you`);
    }
    const event: Omit<LoanCreationEvent, "turn" | "order"> = {
      type: EventType.LoanCreation,
      loan: createLoanStateFromQuote(quote),
    };
    this.game.processEvent(event);
  }
  protected recalculateCreditRating() {
    const totalDebt = this.getTotalLiabilityValue();
    const loanExpensesPerTurn = this.getExpectedLoanExpensesPerTurn();
    const nonLoanExpensesPerTurn = this.getExpectedNonLoanExpensesPerTurn();
    const incomePerTurn = this.getExpectedIncomePerTurn();
    const totalAssets = this.getTotalAssetValue();
    return calculateCreditRating({
      totalAssets,
      totalDebt,
      loanExpensesPerTurn,
      nonLoanExpensesPerTurn,
      incomePerTurn,
    });
  }
  protected recalculateCreditLimit() {
    const totalAssets = this.getTotalNonCashAssetValue();
    const creditLimit = Math.abs(this.config.runtime.maxLeverage * totalAssets);
    return creditLimit;
  }
  protected recalculateCreditRatingLendingThreshold(): CreditRating {
    // TODO: more sophisticated implementation
    if (this.creditRating >= CreditRating.B) {
      return this.creditRating - 4;
    }
    if (this.creditRating > CreditRating.CC) {
      return this.creditRating - 2;
    }
    return CreditRating.D;
  }
  protected getExpectedNonLoanExpensesPerTurn() {
    let expectedExpenses = 0;
    let totalNonOwnedProperties = 0;
    const potentialRents: number[] = [];
    this.game.state.propertyStore.all().forEach(property => {
      const owner = this.game.state.playerStore.get(property.owner);
      if (this.properties.has(property.propertyId) || owner.isBank) {
        return;
      }
      const expectedPropertyRent = calculateExpectedRentForProperty(
        this.game.state,
        property,
        property.owner
      );
      totalNonOwnedProperties++;
      potentialRents.push(expectedPropertyRent);
    });
    if (totalNonOwnedProperties > 0) {
      let potential = 0;
      potentialRents.forEach(rent => {
        const likelyhoodOfLandingOnPropertyTimesRent =
          rent / this.game.state.board.positions.length;
        potential += likelyhoodOfLandingOnPropertyTimesRent;
      });
      expectedExpenses += potential / totalNonOwnedProperties;
    }
    return expectedExpenses;
  }
  protected getExpectedLoanExpensesPerTurn() {
    let expectedExpenses = 0;
    this.debtLoans.forEach(loanId => {
      const payment = this.game.state.loanStore.get(loanId).getNominalPaymentAmount();
      expectedExpenses += payment;
    });
    return expectedExpenses;
  }
  protected getExpectedIncomePerTurn() {
    let expectedIncome = 0;
    this.creditLoans.forEach(loanId => {
      const payment = this.game.state.loanStore.get(loanId).getNominalPaymentAmount();
      if (Number.isNaN(payment)) {
        throw new Error();
      }
      expectedIncome += payment;
    });
    this.properties.forEach(propertyId => {
      const expectedRentPerTurn = calculateExpectedReturnOnPropertyPerTurn(
        this.game.state,
        propertyId,
        this.id
      );
      if (Number.isNaN(expectedRentPerTurn)) {
        throw new Error();
      }
      expectedIncome += expectedRentPerTurn;
    });
    if (Number.isNaN(expectedIncome)) {
      throw new Error();
    }
    return expectedIncome;
  }
  public getNetWorth(): number {
    const totalAssetValue = this.getTotalAssetValue();
    const totalLiabilityValue = this.getTotalLiabilityValue();
    const netWorth = totalAssetValue - totalLiabilityValue;
    return netWorth;
  }
  public recalculateValues(): void {
    this.state.creditRating = this.recalculateCreditRating();
    this.state.creditRatingLendingThreshold = this.recalculateCreditRatingLendingThreshold();
    this.state.netWorth = this.getNetWorth();
    this.state.creditLimit = this.recalculateCreditLimit();
  }
  protected getTotalNonCashAssetValue(): number {
    let value = 0;
    this.state.properties.forEach(id => {
      const property = this.game.state.propertyStore.get(id);
      value += property.realValue;
    });
    this.state.creditLoans.forEach(id => {
      const loan = this.game.state.loanStore.get(id);
      const loanFaceValue = loan.getFaceValue();
      value += loanFaceValue;
    });
    return value;
  }
  public getTotalAssetValue(): number {
    const cash = this.state.cashOnHand;
    const nonCash = this.getTotalNonCashAssetValue();
    return cash + nonCash;
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
  async getLoanQuotesFromOtherPlayers(
    amount: number,
    depth: number,
    exclude?: PlayerId[]
  ): Promise<LoanQuote[]> {
    if (depth > this.config.runtime.maxCreditChainDepth) {
      return [];
    }
    const players = ["Bank_0" as PlayerId, ...this.game.state.playerTurnOrder].map(playerId => {
      if (playerId !== this.id && !exclude?.includes(playerId)) {
        return this.game.state.playerStore.get(playerId);
      }
      return null;
    });
    const quotes: LoanQuote[] = [];
    for await (const player of players) {
      if (player === null) {
        continue;
      }
      const offer = await player.getLoanQuoteForPlayer(this.id, amount, depth);
      if (offer) {
        // console.log(`Got loan offer from ${player.id}`);
        quotes.push(offer);
      } else {
        // console.log(`${player.id} declined to offer a loan`);
      }
    }
    return quotes;
  }
  async getSellPropertyQuotesFromOtherPlayers(
    propertyId: number,
    price: number
  ): Promise<PropertyQuote[]> {
    const players = ["Bank_0" as PlayerId, ...this.game.state.playerTurnOrder].map(playerId => {
      if (playerId !== this.id) {
        return this.game.state.playerStore.get(playerId);
      }
      return null;
    });
    const property = this.game.state.propertyStore.get(propertyId);
    const quotes: PropertyQuote[] = [];
    for await (const player of players) {
      if (!player) {
        continue;
      }
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
  async getLoanQuoteForPlayer(
    playerId: PlayerId,
    amount: number,
    depth: number
  ): Promise<LoanQuote | null> {
    return this.decisionMaker.getLoanQuoteForPlayer(playerId, amount, depth);
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
