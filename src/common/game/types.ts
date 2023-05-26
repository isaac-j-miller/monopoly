import { GameEvent } from "common/events/types";
import { LoanQuote } from "common/loan/types";
import type { IPlayer } from "common/player/types";
import { GameState } from "common/state/types";

export interface IGame {
  readonly state: GameState;
  start(): void;
  takeTurn(): Promise<void>;
  takePlayerTurn(player: IPlayer): Promise<void>;
  createLoan(loan: LoanQuote): void;
  processEvent(event: Omit<GameEvent, "turn" | "order">): void;
}
