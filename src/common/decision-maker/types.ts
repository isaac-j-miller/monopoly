import type { IGame } from "common/game/types";
import { LoanQuote, TransferLoanQuote } from "common/loan/types";
import type { IPlayer } from "common/player/types";
import { PropertyQuote } from "common/property/types";
import { PlayerId } from "common/state/types";

export interface IDecisionMaker {
  decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean | PropertyQuote>;
  decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean>;
  getLoanQuoteForPlayer(
    playerId: PlayerId,
    amount: number,
    depth: number,
    preferredPaymentPerTurn: number
  ): Promise<LoanQuote | null>;
  getPurchasePropertyQuoteForPlayer(
    playerId: PlayerId,
    propertyId: number
  ): Promise<PropertyQuote | null>;
  decideToBuyPropertyFromBank(): Promise<boolean>;
  decideToUseGetOutOfJailFreeCard(): Promise<boolean>;
  decideToPayToGetOutOfJail(): Promise<boolean>;
  decideHowToFinancePayment(amount: number, reason?: string): Promise<LoanQuote | null>;
  coverCashOnHandShortfall(): Promise<void>;
  doOptionalActions(): Promise<void>;
  register(game: IGame, player: IPlayer): void;
}
