import crypto from "crypto";
import { IPlayer } from "common/player/types";
import { RuntimeConfig } from "common/config/types";
import { IGame } from "./types";
import { Board } from "common/board/board";

export class Game implements IGame {
    private _players: IPlayer[];
    private _turn: number;
    constructor(private config: RuntimeConfig, players: IPlayer[]) {
        this._players = players;
        this._turn = 0;
    }
    public get turn() {
        return this._turn;
    }
    public get players() {
        return this._players;
    }
    roll(): [number, number] {
        return [
            crypto.randomInt(1,7),
            crypto.randomInt(1,7)
        ]
    }
    async start(): Promise<void> {
        const {config} = this;
        while (config.turnLimit === null || this.turn < config.turnLimit) {
            await this.takeTurn();
        }
    }
    async takeTurn(): Promise<void> {
        const {players} = this;
        for await (const player of players) {
            await this.takePlayerTurn(player)
        }
        this._turn++;
    }
    private getNewPosition(player: IPlayer, roll: [number, number]): number {
        if(player.state.inJail) {
            return player.state.position;
        }
        const add = roll[0]+roll[1] + player.state.position;
        if(add < Board.length) {
            return add;
        }
        return add - Board.length;
    }
    async takePlayerTurn(player: IPlayer): Promise<void> {
        const {config} = this;
        if(player.isBank) {
            return;
        }
        const roll = this.roll();
        if(
            player.state.inJail && 
            (
                (roll[0]===roll[1]) 
                || (player.state.inJailSince && this.turn > (player.state.inJailSince + config.jail.duration)))) {
            player.state.inJail = false;
        }
        const newPosition = this.getNewPosition(player, roll);
        await player.takeTurn(this, newPosition, roll);
    }

}