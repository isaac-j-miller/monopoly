import { PlayerId } from "common/state/types";
import { ILoan, LoanQuote, LoanState } from "./types";
import { getUniqueId } from "common/util";

export class Loan implements ILoan {
  constructor(private state: LoanState) {
    if (Number.isNaN(this.state.rate)) {
      throw new Error("somehow got a NaN rate");
    }
  }
  toObject(): LoanState {
    return this.state;
  }
  get rateType() {
    return this.state.rateType;
  }
  get remainingPrincipal() {
    return this.state.remainingPrincipal;
  }
  get remainingInterest() {
    return this.state.remainingInterest;
  }
  get initialPrincipal() {
    return this.state.initialPrincipal;
  }
  get term() {
    return this.state.term;
  }
  get id() {
    return this.state.id;
  }
  get rate(): number {
    return this.state.rate;
  }
  get creditor(): PlayerId {
    return this.state.creditor;
  }
  get debtor(): PlayerId {
    return this.state.debtor;
  }
  get nullified(): boolean {
    return this.state.nullified;
  }
  nullify(): void {
    this.state.remainingPrincipal = 0;
    this.state.remainingInterest = 0;
  }
  getFaceValue(): number {
    const normalPaymentAmount = this.getNominalPaymentAmount();
    const remaining = this.getCurrentBalance();
    const numPaymentsMade = Math.floor(remaining / normalPaymentAmount);
    const remainingPayments = this.state.term - numPaymentsMade;
    return remainingPayments * normalPaymentAmount;
  }
  setCreditor(playerId: PlayerId): void {
    this.state.creditor = playerId;
  }
  setRate(rate: number): void {
    this.state.rate = rate;
  }
  getCurrentBalance(): number {
    return this.state.remainingInterest + this.state.remainingPrincipal;
  }
  makePayment(amount: number): number {
    if (amount > this.state.remainingInterest) {
      const remainder = amount - this.state.remainingInterest;
      this.state.remainingInterest = 0;
      this.state.remainingPrincipal -= remainder;
    } else {
      this.state.remainingInterest -= amount;
    }
    return this.getCurrentBalance();
  }
  accrueInterest(): number {
    const balance = this.getCurrentBalance();
    const interest = balance * this.rate;
    this.state.remainingInterest += interest;
    return this.getCurrentBalance();
  }
  getNominalPaymentAmount(): number {
    return getNominalPaymentAmount(this.getCurrentBalance(), this.state.term, this.state.rate);
  }
}

export function getNominalPaymentAmount(amount: number, term: number, rate: number): number {
  const numerator = rate * amount;
  const denominator = 1 - (1 + rate) ** (-1 * term);
  return numerator / denominator;
}

export function createLoanStateFromQuote(quote: LoanQuote): LoanState {
  const { amount, creditor, debtor, rate, rateType, term } = quote;
  return {
    id: getUniqueId(),
    remainingPrincipal: amount,
    initialPrincipal: amount,
    creditor,
    debtor,
    rate,
    rateType,
    term,
    remainingInterest: 0,
    nullified: false,
  };
}

export function getLoanQuoteFaceValue(quote: LoanQuote): number {
  return quote.amount * (quote.rate + 1);
}

export function getInterestRateForLoanQuote(amount: number, desiredFaceValue: number): number {
  return desiredFaceValue / amount - 1;
}
