import { Socket } from "socket.io-client";
import { GameState, PlayerId } from "common/state/types";
import { IPlayer } from "common/player/types";

export class HumanRemoteInterface {
  constructor(
    private readonly socket: Socket,
    private readonly gameState: () => GameState,
    private readonly playerId: PlayerId
  ) {}
  get player(): IPlayer {
    return this.gameState().playerStore.get(this.playerId);
  }
  setup() {}
}
