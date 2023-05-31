import { Socket } from "socket.io";
import { PlayerId } from "common/state/types";
import { SerializedGamePlayer } from "common/shared/types";
import { GameStore } from "./store";
import { deserializeGamePlayerId } from "../serialization";

export class GameSocket {
  readonly gameId: string;
  readonly playerId: PlayerId | undefined;
  constructor(private readonly gameStore: GameStore, readonly socket: Socket) {
    const query = socket.handshake.query;
    const { id } = query;
    const { gameId, playerId } = deserializeGamePlayerId(id as SerializedGamePlayer);
    this.gameId = gameId;
    // TODO: validate PlayerId
    this.playerId = playerId as PlayerId;
  }
  setup() {
    this.socket.join(this.gameId);
    if (this.playerId) {
      this.gameStore.registerPlayer(this.gameId, this.playerId, this, "👨");
      console.log(`registered player ${this.playerId} with game ${this.gameId}`);
    }
  }
  disconnect() {
    console.log(`Disconnecting socket id ${this.socket.id}`)
    this.socket.disconnect(true);
  }
  onError(error: Error) {
    console.error("Error setting up socket", error);
    this.disconnect();
  }
}
