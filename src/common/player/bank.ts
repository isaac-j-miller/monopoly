import { IDecisionMaker } from "common/decision-maker/types";
import { IGame } from "common/game/types";
import { PlayerId, PlayerState } from "common/state/types";
import { RuntimeConfig } from "common/config/types";
import { IPlayer } from "./types";

export class Bank implements IPlayer {
    private _state: PlayerState;
    constructor(public decisionMaker: IDecisionMaker, private config: RuntimeConfig, private _id: PlayerId) {
        this._state = JSON.parse(JSON.stringify(config.players.initialState));
    }
    public get isBank(): boolean {
        return true
    }
    public get state(): PlayerState {
        return this._state;
    }
    public get id(): PlayerId {
        return this._id;
    }
    async takeTurn(game: IGame, newPosition: number, roll: [number, number]): Promise<void> {
        this.state.position = newPosition;
        await this.decisionMaker.takeTurn(game, this, roll)
    }
}