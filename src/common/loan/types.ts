import type { PlayerId, InterestRateType } from "common/state/types";

export type LoanId = string;

export type LoanState = {
  id: LoanId;
  creditor: PlayerId;
  debtor: PlayerId;
  rateType: InterestRateType;
  rate: number;
  remainingPrincipal: number;
  remainingInterest: number;
  readonly initialPrincipal: number;
  term: number;
};

export interface ILoan extends LoanState {
  setCreditor(playerId: PlayerId): void;
  setRate(rate: number): void;
  getCurrentBalance(): number;
  getFaceValue(): number;
  makePayment(amount: number): number;
  accrueInterest(): void;
  getNominalPaymentAmount(): number;
  toObject(): LoanState;
}

export type LoanQuote = {
  rateType: InterestRateType;
  rate: number;
  amount: number;
  term: number;
  creditor: PlayerId;
  debtor: PlayerId;
};
export type TransferLoanQuote = LoanQuote & {
  loanId: LoanId;
  for: PlayerId;
  offer: number;
};
