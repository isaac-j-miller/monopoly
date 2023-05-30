import { LoanQuote, TransferLoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import { PlayerId } from "common/state/types";
import { RuntimeConfig } from "common/config/types";
import { IDecisionMaker } from "common/decision-maker/types";
import { DecisionMakerBase } from "common/decision-maker/base";
import { GameSocket } from "./game";

export class SocketIOHumanDecisionMaker extends DecisionMakerBase implements IDecisionMaker {
  constructor(config: RuntimeConfig, private readonly socket: GameSocket) {
    super(config);
  }
  async doOptionalActions(): Promise<void> {
    // TODO: implement
  }
  async decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean> {
    return false;
  }
  async coverCashOnHandShortfall(): Promise<void> {
    // TODO: implement
  }
  async decideHowToFinancePayment(amount: number): Promise<LoanQuote | null> {
    // TODO: implement
    return null;
  }
  async decideToUseGetOutOfJailFreeCard(): Promise<boolean> {
    return false;
  }
  async decideToPayToGetOutOfJail(): Promise<boolean> {
    return false;
  }
  async decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean> {
    return false;
  }
  async getLoanQuoteForPlayer(playerId: PlayerId, amount: number): Promise<LoanQuote | null> {
    // TODO: implement
    return null;
  }
  async getPurchasePropertyQuoteForPlayer(
    playerId: PlayerId,
    propertyId: number
  ): Promise<PropertyQuote | null> {
    // TODO: implement
    return null;
  }
  async decideToBuyPropertyFromBank(): Promise<boolean> {
    return false;
  }
}
