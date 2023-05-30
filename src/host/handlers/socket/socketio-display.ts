import { Server } from "socket.io";
import { IGame } from "common/game/types";
import { IDisplay } from "common/user-interface/types";

export class SocketIOGameDisplay implements IDisplay {
  private game!: IGame;
  constructor(private readonly io: Server, readonly gameId: string) {}
  update(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  register(game: IGame): void {
    this.game = game;
  }
}
