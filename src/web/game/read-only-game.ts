import { GameEvent } from "common/events/types";
import { EventHook, GameConfig, IGame } from "common/game/types";
import { LoanQuote } from "common/loan/types";
import { IPlayer } from "common/player/types";
import { GameState } from "common/state/types";

export class ReadOnlyGame implements IGame {
  constructor(readonly gameConfig: GameConfig, private readonly gameState: () => GameState) {}
  get state() {
    return this.gameState();
  }
  addPlayer(player: IPlayer): void {
    throw new Error("Method not implemented.");
  }
  start(): void {
    throw new Error("Method not implemented.");
  }
  isReady(): boolean {
    throw new Error("Method not implemented.");
  }
  takeTurn(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  takePlayerTurn(player: IPlayer): Promise<void> {
    throw new Error("Method not implemented.");
  }
  createLoan(loan: LoanQuote): void {
    throw new Error("Method not implemented.");
  }
  processEvent(event: Omit<GameEvent, "turn" | "order">): void {
    throw new Error("Method not implemented.");
  }
  registerEventHook(hook: EventHook): void {
    throw new Error("Method not implemented.");
  }
}
