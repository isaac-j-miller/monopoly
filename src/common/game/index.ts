import crypto from "crypto";
import { IPlayer } from "common/player/types";
import { RuntimeConfig } from "common/config/types";
import { EventBus } from "common/events/bus";
import {
  CompletePlayerTurnEvent,
  CompleteTurnEvent,
  EventType,
  GameEvent,
  LoanCreationEvent,
  RollEvent,
  StartPlayerTurnEvent,
} from "common/events/types";
import { PlayerId } from "common/state/types";
import { createLoanFromQuote } from "common/loan";
import { LoanQuote } from "common/loan/types";
import { EventHook, GameConfig, IGame } from "./types";

export class Game implements IGame {
  constructor(
    private config: RuntimeConfig,
    private bus: EventBus,
    readonly gameConfig: GameConfig
  ) {}
  registerEventHook(hook: EventHook) {
    this.bus.registerEventHook(hook);
  }
  public get turn() {
    return this.bus.state.turn;
  }
  public get currentPlayerTurn() {
    return this.bus.state.currentPlayerTurn;
  }
  public get players() {
    const players: IPlayer[] = [];
    this.bus.state.playerTurnOrder.forEach(id => {
      const player = this.bus.state.playerStore.get(id);
      if (player) {
        players.push(player);
      }
    });
    return players;
  }
  public get state() {
    return this.bus.state;
  }
  private getRoll(): [number, number] {
    return [crypto.randomInt(1, 7), crypto.randomInt(1, 7)];
  }
  isReady(): boolean {
    // TODO: determine if number of players is equal to config number of players
    return true;
  }
  addPlayer(player: IPlayer): void {
    const idx = this.players.findIndex(p => p.id === player.id);
    this.state.playerStore.set(player);
    if (this.state.playerTurnOrder.includes(player.id)) {
      return;
    }
    this.state.playerTurnOrder.push(player.id);
  }
  createLoan(quote: LoanQuote) {
    const event: LoanCreationEvent = {
      loan: createLoanFromQuote(quote),
      order: this.state.currentPlayerTurn,
      turn: this.state.turn,
      type: EventType.LoanCreation,
    };
    this.processEvent(event);
  }
  private roll(player: PlayerId) {
    const roll = this.getRoll();
    const rollEvent: RollEvent = {
      type: EventType.Roll,
      order: this.currentPlayerTurn,
      player,
      roll,
      turn: this.turn,
    };
    this.processEventInternal(rollEvent);
  }
  async start(): Promise<void> {
    const { config } = this;
    this.processEvent({
      type: EventType.StartGame,
    });
    while (config.turnLimit === null || this.turn < config.turnLimit) {
      await this.takeTurn();
    }
  }
  async takeTurn(): Promise<void> {
    const { players } = this;
    for await (const player of players) {
      await this.takePlayerTurn(player);
    }
    const endTurnEvent: CompleteTurnEvent = {
      order: this.currentPlayerTurn + 1,
      turn: this.turn,
      type: EventType.CompleteTurn,
    };
    this.processEventInternal(endTurnEvent);
  }
  async takePlayerTurn(player: IPlayer): Promise<void> {
    if (player.isBank) {
      return;
    }
    const event: Omit<StartPlayerTurnEvent, "turn" | "order"> = {
      type: EventType.StartPlayerTurn,
      player: player.id,
    };
    this.processEvent(event);
    this.roll(player.id);
    await player.takeTurn();
    player.recalculateValues();
    const endPlayerTurnEvent: Omit<CompletePlayerTurnEvent, "turn" | "order"> = {
      type: EventType.CompletePlayerTurn,
      player: player.id,
    };
    this.processEvent(endPlayerTurnEvent);
  }
  private processEventInternal(event: GameEvent): void {
    this.bus.processEvent(event);
  }
  processEvent(event: Omit<GameEvent, "turn" | "order">): void {
    this.processEventInternal({
      ...(event as GameEvent),
      turn: this.turn,
      order: this.currentPlayerTurn,
    });
  }
}
