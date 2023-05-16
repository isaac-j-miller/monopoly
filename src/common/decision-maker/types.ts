import type { IGame } from "common/game/types";
import type { IPlayer } from "common/player/types";

export interface IDecisionMaker {
    takeTurn: (game: IGame, player: IPlayer, roll: [number, number]) => Promise<void>;
}