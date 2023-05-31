import { TransferLoanQuote, LoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import { DecisionMakerBase } from "./base";
import { IDecisionMaker } from "./types";

export class NoopDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
  async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async getLoanQuoteForPlayer(
    playerId: `Player_${number}` | `Bank_${number}`,
    amount: number
  ): Promise<LoanQuote | null> {
    throw new Error("Method not implemented.");
  }
  async getPurchasePropertyQuoteForPlayer(
    playerId: `Player_${number}` | `Bank_${number}`,
    propertyId: number
  ): Promise<PropertyQuote | null> {
    throw new Error("Method not implemented.");
  }
  async decideToBuyPropertyFromBank(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async decideToUseGetOutOfJailFreeCard(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async decideToPayToGetOutOfJail(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async decideHowToFinancePayment(amount: number, reason: string): Promise<LoanQuote | null> {
    throw new Error("Method not implemented.");
  }
  async coverCashOnHandShortfall(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async doOptionalActions(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
