import type { IGame } from "common/game/types";
import type { PlayerId, PlayerState } from "common/state/types";

export interface IPlayer {
    readonly id: PlayerId;
    readonly state: PlayerState;
    readonly isBank: boolean;
    takeTurn: (game: IGame, newPosition: number, roll: [number, number]) => Promise<void>;
}