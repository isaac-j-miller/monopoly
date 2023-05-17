import { IGame } from "common/game/types";
import { IPlayer } from "./types";
import { PlayerBase } from "./base";

export class Player  extends PlayerBase implements IPlayer {
    public get isBank(): boolean {
        return false
    }
    register(game: IGame) {
        this.game = game;
        this.decisionMaker.register(game, this)
    }
    async takeTurn(): Promise<void> {
        await this.decisionMaker.takeTurn()
    }
}