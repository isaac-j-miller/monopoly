import { IGame } from "common/game/types";
import { IPlayer } from "./types";
import { PlayerBase } from "./base";

export class Bank extends PlayerBase implements IPlayer {
    public get isBank(): boolean {
        return true
    }
    register(game: IGame) {
        this.game = game;
        this.decisionMaker.register(game, this)
    }
    async takeTurn(): Promise<void> {
        return;
    }
}