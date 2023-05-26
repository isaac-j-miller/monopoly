import { ILoan, LoanId } from "common/loan/types";
import { ILoanStore } from "./types";

export class LoanStore implements ILoanStore {
  private loans: Record<LoanId, ILoan>;
  constructor(loans: ILoan[]) {
    this.loans = {};
    loans.forEach(loan => {
      this.add(loan);
    });
  }
  add(loan: ILoan): void {
    this.loans[loan.id] = loan;
  }
  get(id: LoanId): ILoan {
    return this.loans[id];
  }
}
