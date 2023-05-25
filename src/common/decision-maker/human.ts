import { LoanQuote, TransferLoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import { PlayerId } from "common/state/types";
import { IDecisionMaker } from "./types";
import { DecisionMakerBase } from "./base";

export class HumanDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
    async doOptionalActions(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async coverCashOnHandShortfall(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async decideHowToFinancePayment(amount: number): Promise<LoanQuote | null> {
        throw new Error("Method not implemented.");
    }
    async decideToUseGetOutOfJailFreeCard(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async decideToPayToGetOutOfJail(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async getLoanQuoteForPlayer(playerId: PlayerId): Promise<LoanQuote | null> {
        throw new Error("Method not implemented.");
    }
    async getPurchasePropertyQuoteForPlayer(playerId: PlayerId, propertyId: number): Promise<PropertyQuote | null> {
        throw new Error("Method not implemented.");
    }
    async decideToBuyPropertyFromBank(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}