import type { IGame } from "common/game/types";
import { LoanQuote } from "common/loan/types";
import type { IPlayer } from "common/player/types";
import { PropertyQuote } from "common/property/types";
import { PlayerId } from "common/state/types";

export interface IDecisionMaker {
    takeTurn: () => Promise<void>;
    decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean>;
    getLoanQuoteForPlayer(playerId: PlayerId, amount: number): Promise<LoanQuote|null>
    getPurchasePropertyQuoteForPlayer(playerId: PlayerId, propertyId: number): Promise<PropertyQuote|null>;
    decideToBuyPropertyFromBank(): Promise<boolean>;
    register(game: IGame, player: IPlayer): void;
}