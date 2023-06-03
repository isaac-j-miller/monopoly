import { LoanQuote, TransferLoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import { InterestRateType, PlayerId } from "common/state/types";
import { IDecisionMaker } from "./types";
import { DecisionMakerBase } from "./base";

export class BankDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
  async doOptionalActions(): Promise<void> {
    // the bank doesn't do anything optional
    return;
  }
  async decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean> {
    // TODO: maybe allow bank to buy/sell existing loans
    return false;
  }
  async coverCashOnHandShortfall(): Promise<void> {
    throw new Error("bank doesn't care about cash on hand shortfall (yet)");
  }
  async decideHowToFinancePayment(): Promise<LoanQuote | null> {
    throw new Error("bank cannot take out loans");
  }
  async decideToUseGetOutOfJailFreeCard(): Promise<boolean> {
    throw new Error("bank cannot be in jail");
  }
  async decideToPayToGetOutOfJail(): Promise<boolean> {
    throw new Error("bank cannot be in jail");
  }
  async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
    const { propertyId, offer } = quote;
    const property = this.game.state.propertyStore.get(propertyId);
    const { realValue } = property;
    if (quote.owner === this.player.id) {
      // this is a sell quote
      return offer >= realValue;
    } else {
      // this is a buy quote
      return offer <= realValue;
    }
  }
  async getLoanQuoteForPlayer(playerId: PlayerId, amount: number): Promise<LoanQuote | null> {
    const player = this.game.state.playerStore.get(playerId);
    const { creditRating, creditLimit } = player;
    const futureDebt = player.getTotalLiabilityValue() + amount;
    const { creditRatingLendingThreshold } = this.player;
    if (
      creditRating < creditRatingLendingThreshold ||
      futureDebt > creditLimit ||
      amount > this.player.cashOnHand
    ) {
      return null;
    }

    const interestRate = this.config.bank.startingInterestRate;
    const multiplier = this.config.credit.ratingMultiplierOnInterest[creditRating];
    const rate = interestRate * multiplier;
    const quote: LoanQuote = {
      // TODO: figure out variable rate loans
      rateType: InterestRateType.Fixed,
      amount,
      creditor: this.player.id,
      debtor: playerId,
      rate,
      // TODO: figure out how to determine an acceptable term
      term: 20,
    };
    return quote;
  }
  async getPurchasePropertyQuoteForPlayer(
    playerId: PlayerId,
    propertyId: number
  ): Promise<PropertyQuote | null> {
    const property = this.game.state.propertyStore.get(propertyId);
    if (property.owner !== this.player.id) {
      return null;
    }
    const quote: PropertyQuote = {
      ...property,
      offer: property.realValue,
      for: playerId,
    };
    return quote;
  }
  async decideToBuyPropertyFromBank(): Promise<boolean> {
    // the bank can't buy property from the bank
    return false;
  }
}
