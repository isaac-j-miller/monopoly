import type { IPlayer } from "common/player/types";

export interface IGame {
    readonly players: IPlayer[];
    readonly turn:  number;
    roll(): [number, number];
    start(): void;
    takeTurn(): Promise<void>;
    takePlayerTurn(player: IPlayer): Promise<void>;
}