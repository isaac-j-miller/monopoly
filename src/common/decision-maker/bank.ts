import { LoanQuote, TransferLoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import { InterestRateType, PlayerId } from "common/state/types";
import { currencyFormatter } from "common/formatters/number";
import { IDecisionMaker } from "./types";
import { DecisionMakerBase } from "./base";
import { calculateLoanTermFromAmountPaymentAndRate } from "./util";

export class BankDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
  async doOptionalActions(): Promise<void> {
    // the bank doesn't do anything optional
    return;
  }
  async decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean> {
    if (quote.creditor === this.player.id) {
      // we are selling one of our own loans;
      // the bank doesn't do this (yet)
      return false;
    }
    // we are buying someone else's loan
    const loan = this.game.state.loanStore.get(quote.loanId);
    const debtor = this.game.state.playerStore.get(loan.debtor);
    const debtorCreditRating = debtor.creditRating;
    const faceValue = loan.getFaceValue();
    // TODO: add riskiness into calculation
    const ratingAdjustedValue =
      faceValue * this.config.credit.ratingMultiplierOnDebtAssetValue[debtorCreditRating];
    return Math.round(quote.offer) <= Math.round(ratingAdjustedValue);
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
    const { realValue, marketValue } = property;
    const maxPrice = Math.max(realValue, marketValue);
    if (quote.owner === this.player.id) {
      // this is a sell quote
      return Math.round(offer) >= Math.round(realValue);
    } else {
      // this is a buy quote
      const answer = Math.round(offer) <= Math.round(maxPrice);
      if (answer) {
        console.log(
          `Bank would buy back ${property.name} (${propertyId}) from ${
            quote.owner
          } for ${currencyFormatter(offer)}`
        );
      }
      return answer;
    }
  }
  async getLoanQuoteForPlayer(
    playerId: PlayerId,
    requestedAmount: number,
    _depth: number,
    preferredPaymentPerTurn: number
  ): Promise<LoanQuote | null> {
    const amount = requestedAmount < 10 ? 10 : Math.round(requestedAmount);
    const player = this.game.state.playerStore.get(playerId);
    const { creditRating, creditLimit } = player;
    const futureDebt = player.getTotalLiabilityValue() + amount;
    const { creditRatingLendingThreshold } = this.player;
    if (
      creditRating < creditRatingLendingThreshold ||
      futureDebt > creditLimit ||
      // maybe re-enable this in the future
      amount > this.player.cashOnHand
    ) {
      return null;
    }

    const interestRate = this.config.bank.startingInterestRate;
    const multiplier = this.config.credit.ratingMultiplierOnInterest[creditRating];
    const rate = interestRate * multiplier;
    const term = calculateLoanTermFromAmountPaymentAndRate(amount, rate, preferredPaymentPerTurn);
    const quote: LoanQuote = {
      // TODO: figure out variable rate loans
      rateType: InterestRateType.Fixed,
      amount,
      creditor: this.player.id,
      debtor: playerId,
      rate,
      term,
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
