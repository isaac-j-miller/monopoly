import { LoanId, LoanState } from "common/loan/types";
import { GenericProperty } from "common/property/types";
import { BoardPosition, PositionType } from "common/board/types";
import { PlayerId, PlayerState } from "./types";

export type SocketStateUpdate = {
  players: Record<PlayerId, PlayerState>;
  loans: Record<LoanId, LoanState>;
  properties: Record<number, GenericProperty>;
  board: BoardPosition<PositionType>[];
  playerTurnOrder: PlayerId[];
  // TODO: add cards
};
