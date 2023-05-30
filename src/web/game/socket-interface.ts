import axios from "axios";
import { Socket } from "socket.io-client";
import { PlayerId } from "common/state/types";
import { assertIsDefined } from "common/util";
import { GamePlayer, SerializedGamePlayer } from "common/shared/types";

export class SocketInterface {
  private _initialized = false;
  private _gamePlayer?: GamePlayer;
  constructor(
    readonly socket: Socket,
    private key: SerializedGamePlayer,
    private setReadyState: (state: boolean) => void
  ) {}
  get isReady(): boolean {
    return false;
  }
  get gameId(): string {
    assertIsDefined(this._gamePlayer);
    return this._gamePlayer.gameId;
  }
  get playerId(): PlayerId {
    assertIsDefined(this._gamePlayer);
    return this._gamePlayer.playerId;
  }
  async setup() {
    if (this._initialized) {
      return;
    }
    await axios.get<GamePlayer>(`/api/parse-key/${this.key}`).then(resp => {
      this._gamePlayer = resp.data;
    });
    // TODO: set up listeners
    this._initialized = true;
    this.setReadyState(true);
  }
}
