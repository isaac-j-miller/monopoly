import { Socket } from "socket.io";
import { RuntimeConfig } from "common/config/types";
import { GameSocket } from "./game";
import { GameStore } from "./store";

export function handleGameSocketConnection(
  config: RuntimeConfig,
  gameStore: GameStore,
  socket: Socket
) {
  const game = new GameSocket(config, gameStore, socket);
  try {
    game.setup();
  } catch (err) {
    const error = err as Error;
    game.onError(error);
  }
}
