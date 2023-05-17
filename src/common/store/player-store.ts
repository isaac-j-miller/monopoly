import { IPlayer } from "common/player/types";
import { PlayerId } from "common/state/types";
import { IPlayerStore } from "./types";

export class PlayerStore implements IPlayerStore {
    private players: Record<PlayerId,IPlayer>
    constructor(players: IPlayer[]) {
        this.players = {}
        players.forEach(player => {
            this.add(player)
        })
    }
    add(player: IPlayer): void {
        this.players[player.id] = player
    }
    get(id: PlayerId): IPlayer {
        return this.players[id];
    }
}