import { Socket } from "socket.io";
import { GameSocket } from "./game";
import { GameStore } from "./store";

export function handleGameSocketConnection(gameStore: GameStore, socket: Socket) {
  const game = new GameSocket(gameStore, socket);
  try {
    game.setup();
  } catch(err) {
    const error = err as Error;
    game.onError(error);
  }
}
