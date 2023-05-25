import type { PlayerId, InterestRateType } from "common/state/types";

export type LoanId = `Creditor:${PlayerId};Debtor:${PlayerId};${string}`

export interface ILoan {
    readonly id: LoanId;
    readonly creditor: PlayerId;
    readonly debtor: PlayerId;
    readonly rateType: InterestRateType;
    readonly rate: number;
    readonly remainingPrincipal: number;
    readonly remainingInterest: number;
    readonly initialPrincipal: number;
    readonly term: number;
    setCreditor(playerId: PlayerId): void;
    setRate(rate: number): void;
    getCurrentBalance(): number;
    getFaceValue(): number;
    makePayment(amount: number): number;
    accrueInterest(): void;
    getNominalPaymentAmount(): number;
}

export type LoanQuote = {
    rateType: InterestRateType;
    rate: number;
    amount: number;
    term: number;
    creditor: PlayerId;
    debtor: PlayerId;
}
export type TransferLoanQuote = LoanQuote & {
    loanId: LoanId;
    for: PlayerId;
    offer: number;
}