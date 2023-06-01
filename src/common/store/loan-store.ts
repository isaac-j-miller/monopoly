import { ILoan, LoanId } from "common/loan/types";
import { ILoanStore } from "./types";
import { isPromise } from "common/util";

export class LoanStore implements ILoanStore {
  private loans: Record<LoanId, ILoan>;
  constructor(loans: ILoan[]) {
    this.loans = {};
    loans.forEach(loan => {
      this.set(loan);
    });
  }
  set(loan: ILoan): void {
    this.loans[loan.id] = loan;
  }
  get(id: LoanId): ILoan {
    return this.loans[id];
  }
  all(): ILoan[] {
    return Object.values(this.loans);
  }
  withLoan<T>(id: LoanId, fn: (loan: ILoan) => T): T {
    const loan = this.get(id);
    const result = fn(loan);
    if (isPromise(result)) {
      result.then(() => {
        this.set(loan);
      });
    } else {
      this.set(loan);
    }
    return result;
  }
}
