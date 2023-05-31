import { LoanId, LoanState } from "common/loan/types";
import { GenericProperty } from "common/property/types";
import { PlayerId, PlayerState } from "./types"

export type SocketStateUpdate = {
    players: Record<PlayerId, PlayerState>;
    loans: Record<LoanId, LoanState>;
    properties: Record<number, GenericProperty>;
}