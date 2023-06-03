import { Server } from "socket.io";
import { IGame } from "common/game/types";
import { IDisplay } from "common/user-interface/types";
import { EventType, GameEvent } from "common/events/types";
import { SocketStateUpdate } from "common/state/socket";
import { LoanId, LoanState } from "common/loan/types";
import { GenericProperty } from "common/property/types";
import { PlayerId, SerializablePlayerState } from "common/state/types";
import { GameStore } from "./store";

export class SocketIOGameDisplay implements IDisplay {
  constructor(
    private readonly io: Server,
    readonly gameId: string,
    private readonly gameStore: GameStore
  ) {}
  processEvent = (event: GameEvent) => {
    this.io.to(this.gameId).emit("GAME_EVENT", event);
    if (event.type === EventType.CompleteTurn) {
      const state = this.getState();
      this.io.to(this.gameId).emit("SNAPSHOT", state);
    }
  };
  getState = (): SocketStateUpdate => {
    return this.gameStore.withGame(this.gameId, game => {
      const update: SocketStateUpdate = {
        players: game.state.playerTurnOrder.reduce((record, id) => {
          record[id] = game.state.playerStore.get(id).getState();
          return record;
        }, {} as Record<PlayerId, SerializablePlayerState>),
        loans: game.state.loanStore.all().reduce((acc, curr) => {
          acc[curr.id] = curr.toObject();
          return acc;
        }, {} as Record<LoanId, LoanState>),
        properties: game.state.propertyStore.all().reduce((acc, curr) => {
          acc[curr.propertyId] = curr;
          return acc;
        }, {} as Record<number, GenericProperty>),
        board: game.state.board.positions,
        playerTurnOrder: game.state.playerTurnOrder,
        started: game.state.started,
        turn: game.state.turn,
        currentPlayerTurn: game.state.currentPlayerTurn,
        // TODO: add cards
      };
      update.players["Bank_0"] = game.state.playerStore.get("Bank_0").getState();
      return update;
    });
  };
  register(): void {
    this.gameStore.withGame(this.gameId, game => {
      game.registerEventHook(this.processEvent);
    });
  }
}
