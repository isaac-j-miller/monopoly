import { InterestRateType, PlayerId } from "common/state/types";
import { ILoan, LoanId, LoanQuote } from "./types";
import { getUniqueId } from "common/util";

export class Loan implements ILoan {
    constructor(
        readonly debtor: PlayerId, 
        private _creditor: PlayerId,
        readonly rateType: InterestRateType,
        private _rate: number,
        readonly initialPrincipal: number,
        readonly term: number
        ) {
            this.remainingPrincipal = initialPrincipal;
            this.remainingInterest = 0;
            this.id = `Creditor:${_creditor};Debtor:${debtor};${getUniqueId()}`
            this.totalPaid = 0
    }
    readonly id: LoanId;
    get rate(): number {
        return this._rate;
    }
    private totalPaid: number
    remainingPrincipal: number;
    remainingInterest: number;
    get creditor(): PlayerId {
        return this._creditor;
    }
    getFaceValue(): number {
        const normalPaymentAmount = this.getNominalPaymentAmount();
        const numPaymentsApprox = Math.floor(this.totalPaid/normalPaymentAmount);
        const remainingPayments = this.term - numPaymentsApprox;
        const currentBalance = this.getCurrentBalance()
        return remainingPayments*currentBalance*this.rate;
    }
    setCreditor(playerId: PlayerId): void {
        this._creditor = playerId
    }
    setRate(rate: number): void {
        this._rate = rate;
    }
    getCurrentBalance(): number {
        return this.remainingInterest + this.remainingPrincipal
    }
    makePayment(amount: number): number {
        if(amount > this.remainingInterest) {
            const remainder = amount - this.remainingInterest;
            this.remainingInterest = 0;
            this.remainingPrincipal -= remainder;
        } else {
            this.remainingInterest -= amount;
        }
        this.totalPaid += amount
        return this.getCurrentBalance();
    }
    accrueInterest(): number {
        const balance = this.getCurrentBalance();
        const interest = balance * this.rate;
        this.remainingInterest+=interest
        return this.getCurrentBalance();
    }
    getNominalPaymentAmount(): number {
        const totalAmountDue = this.initialPrincipal + this.term*this.initialPrincipal*this.rate;
        return totalAmountDue / this.term;
    }
}


export function createLoanFromQuote(quote: LoanQuote): ILoan {
    return new Loan(quote.debtor,
        quote.creditor,
        quote.rateType,
        quote.rate, 
        quote.amount, 
        quote.term)
}