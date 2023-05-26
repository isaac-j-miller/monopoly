import { RuntimeConfig } from "common/config/types";
import { IGame } from "common/game/types";
import { IPlayer } from "common/player/types";

export class DecisionMakerBase {
  protected game!: IGame;
  protected player!: IPlayer;
  constructor(protected readonly config: RuntimeConfig) {}
  register(game: IGame, player: IPlayer) {
    this.game = game;
    this.player = player;
  }
}
