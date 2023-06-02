import { Socket } from "socket.io";
import { PlayerId, PlayerState } from "common/state/types";
import { SerializedGamePlayer } from "common/shared/types";
import { assertIsDefined } from "common/util";
import { HumanOrComputerPlayerType, RuntimeConfig } from "common/config/types";
import { deserializeGamePlayerId } from "../serialization";
import { SocketIOGameDisplay } from "./socketio-display";
import { GameStore } from "./store";

export class GameSocket {
  readonly gameId: string;
  readonly playerId: PlayerId | null;
  private display!: SocketIOGameDisplay;
  constructor(
    private readonly config: RuntimeConfig,
    private readonly gameStore: GameStore,
    readonly socket: Socket
  ) {
    const query = socket.handshake.query;
    const { id } = query;
    const { gameId, playerId } = deserializeGamePlayerId(id as SerializedGamePlayer);
    this.gameId = gameId;
    // TODO: validate PlayerId
    this.playerId = playerId as PlayerId;
  }
  setup() {
    this.gameStore.withGame(this.gameId, game => {
      const display = this.gameStore.getDisplay(this.gameId);
      assertIsDefined(game, `game with id ${this.gameId} not found`);
      assertIsDefined(display);
      this.display = display;
      this.socket.on("REQUEST_STATE", cb => {
        console.log("received REQUEST_STATE");
        const state = this.display.getState();
        cb(state);
      });
      this.socket.join(this.gameId);
      if (this.playerId) {
        const params = this.gameStore.getGameOriginalParams(this.gameId);
        const [_, iString] = this.playerId.split("_");
        const i = Number.parseInt(iString);
        assertIsDefined(params);
        const playerState: PlayerState = {
          ...this.config.players.initialState,
          cashOnHand: params.bank.startingMoney,
          // TODO: make emoji configurable
          emoji: this.config.players.emojiPool[i],
          type: HumanOrComputerPlayerType.Human,
        };
        this.gameStore.registerPlayer(this.gameId, this.playerId, this, playerState);
        console.log(`registered player ${this.playerId} with game ${this.gameId}`);
      }
      game.state.playerTurnOrder.forEach(id => {
        const player = game.state.playerStore.get(id);
        player.register(game);
      });
      this.socket.once("START_GAME", () => {
        game.start();
      });
    });
  }
  disconnect() {
    console.log(`Disconnecting socket id ${this.socket.id}`);
    this.socket.disconnect(true);
  }
  onError(error: Error) {
    console.error("Error setting up socket", error);
    this.disconnect();
  }
}
