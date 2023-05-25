import crypto from "crypto";
import { IPlayer } from "common/player/types";
import { RuntimeConfig } from "common/config/types";
import { EventBus } from "common/events/bus";
import { CompletePlayerTurnEvent, CompleteTurnEvent, EventType, GameEvent, LoanCreationEvent, RollEvent } from "common/events/types";
import { PlayerId } from "common/state/types";
import { createLoanFromQuote } from "common/loan";
import { LoanQuote } from "common/loan/types";
import { IGame } from "./types";

export class Game implements IGame {
    constructor(
        private config: RuntimeConfig, 
        private bus: EventBus,
        ) {
    }
    public get turn() {
        return this.bus.state.turn;
    }
    public get currentPlayerTurn() {
        return this.bus.state.currentPlayerTurn;
    }
    public get players() {
        return this.bus.state.playerTurnOrder.map(id=>this.bus.state.playerStore.get(id));
    }
    public get state() {
        return this.bus.state;
    }
    private getRoll(): [number, number] {
        return [
            crypto.randomInt(1,7),
            crypto.randomInt(1,7)
        ]
    }
    createLoan(quote: LoanQuote) {
        const event: LoanCreationEvent  = {
            loan: createLoanFromQuote(quote),
            order: this.state.currentPlayerTurn,
            turn: this.state.turn,
            type: EventType.LoanCreation
        }
        this.processEvent(event)
    }
    private roll(player: PlayerId) {
        const roll = this.getRoll();
        const rollEvent: RollEvent = {
            type: EventType.Roll,
            order: this.currentPlayerTurn,
            player,
            roll,
            turn: this.turn,
        }
        this.bus.processEvent(rollEvent);
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
        const endTurnEvent: CompleteTurnEvent = {
            order: this.currentPlayerTurn + 1,
            turn: this.turn,
            type: EventType.CompleteTurn
        }
        this.bus.processEvent(endTurnEvent);
    }
    async takePlayerTurn(player: IPlayer): Promise<void> {
        if(player.isBank) {
            return;
        }
        this.roll(player.id);
        await player.takeTurn();
        player.recalculateValues()
        const endPlayerTurnEvent: CompletePlayerTurnEvent = {
            type: EventType.CompletePlayerTurn,
            order: this.currentPlayerTurn,
            turn: this.turn,
            player: player.id,
        }
        this.bus.processEvent(endPlayerTurnEvent)
    }
    processEvent(event: Omit<GameEvent, "turn" | "order">): void {
        this.bus.processEvent({
            ...event as GameEvent,
            turn: this.turn,
            order: this.currentPlayerTurn
        })
    }
}