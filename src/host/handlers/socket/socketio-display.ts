import { Server } from "socket.io";
import { IGame } from "common/game/types";
import { IDisplay } from "common/user-interface/types";
import { SocketStateUpdate } from "common/state/socket";
import { PlayerId, PlayerState } from "common/state/types";
import { LoanId, LoanState } from "common/loan/types";
import { GenericProperty } from "common/property/types";

export class SocketIOGameDisplay implements IDisplay {
  private game!: IGame;
  constructor(private readonly io: Server, readonly gameId: string) {
  }
  async update(): Promise<void> {
    const {io, gameId} = this;
    
    const update: SocketStateUpdate = {
      players: this.game.state.playerTurnOrder.reduce((record, id) => {
        record[id] = this.game.state.playerStore.get(id).getState();
        return record;
      }, {} as Record<PlayerId, PlayerState>),
      loans: this.game.state.loanStore.all().reduce((acc, curr) => {
        acc[curr.id] = curr.toObject();
        return acc;
      }, {} as Record<LoanId, LoanState>),
      properties: this.game.state.propertyStore.all().reduce((acc, curr) => {
        acc[curr.propertyId] = curr;
        return acc;
      }, {} as Record<number, GenericProperty>)

    }
    // TODO: acknowledge receipts
    io.to(gameId).emit("STATE_UPDATE", update)
  }
  register(game: IGame): void {
    this.game = game;
  }
}
