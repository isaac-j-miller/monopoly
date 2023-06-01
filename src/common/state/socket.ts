import { LoanId, LoanState } from "common/loan/types";
import { GenericProperty } from "common/property/types";
import { BoardPosition, PositionType } from "common/board/types";
import { PlayerId, SerializablePlayerState } from "./types";

export type SocketStateUpdate = {
  players: Record<PlayerId, SerializablePlayerState>;
  loans: Record<LoanId, LoanState>;
  properties: Record<number, GenericProperty>;
  board: BoardPosition<PositionType>[];
  playerTurnOrder: PlayerId[];
  started: boolean;
  turn: number;
  currentPlayerTurn: number;
  // TODO: add cards
};
