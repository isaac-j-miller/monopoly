import { IPlayer } from "common/player/types";
import { PlayerId } from "common/state/types";
import { IPlayerStore } from "./types";
import { isPromise } from "common/util";

export class PlayerStore implements IPlayerStore {
  private players: Record<PlayerId, IPlayer>;
  constructor(players: IPlayer[]) {
    this.players = {};
    players.forEach(player => {
      this.set(player);
    });
  }
  set(player: IPlayer): void {
    this.players[player.id] = player;
  }
  get(id: PlayerId): IPlayer {
    return this.players[id];
  }
  withPlayer<T>(id: PlayerId, fn: (player: IPlayer) => T): T {
    const player = this.get(id);
    const result = fn(player);
    if (isPromise(result)) {
      result.then(() => {
        this.set(player);
      });
    } else {
      this.set(player);
    }
    return result;
  }
}
