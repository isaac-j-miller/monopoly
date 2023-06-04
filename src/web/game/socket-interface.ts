import axios from "axios";
import { Socket } from "socket.io-client";
import { GameState, PlayerId } from "common/state/types";
import { assertIsDefined } from "common/util";
import { OptionalGamePlayer, SerializedGamePlayer } from "common/shared/types";
import { GameEvent } from "common/events/types";
import { EventBus } from "common/events/bus";
import { SocketStateUpdate } from "common/state/socket";
import { HumanOrComputerPlayerType, RuntimeConfig } from "common/config/types";
import { getRuntimeConfig } from "common/config";
import { GameConfig, IGame } from "common/game/types";
import { HumanRemoteInterface } from "./human-interface";
import { ReadOnlyGame } from "./read-only-game";
import { getStateFromSnapshot } from "./snapshot";
import { SnapshotProcessor } from "./snapshot-processor";
import { dataGenerators } from "./data-generators";

export class SocketInterface {
  private _initialized = false;
  private _gamePlayer?: OptionalGamePlayer;
  private bus!: EventBus;
  private config: RuntimeConfig;
  public humanInterface?: HumanRemoteInterface;
  private gameConfig!: GameConfig;
  private game!: IGame;
  public readonly snapshots:SnapshotProcessor;
  constructor(
    readonly socket: Socket,
    private key: SerializedGamePlayer,
    private setReadyState: (state: boolean) => void,
    private counter: () => number,
    private incrementCounter: () => void,
    private readonly onSocketDisconnect: (reason: Socket.DisconnectReason) => void,
    incrementSnapshotCounter: ()=>void
  ) {
    this.config = getRuntimeConfig();
    this.snapshots = new SnapshotProcessor(dataGenerators, incrementSnapshotCounter);
  }
  get state(): GameState {
    return this.bus.state;
  }
  get isReady(): boolean {
    return false;
  }
  get gameId(): string {
    assertIsDefined(this._gamePlayer);
    return this._gamePlayer.gameId;
  }
  get playerId(): PlayerId | null {
    assertIsDefined(this._gamePlayer);
    return this._gamePlayer.playerId;
  }
  processEvent = (event: GameEvent) => {
    this.bus.processEvent(event);
    this.incrementCounter();
  };
  async getInitialState() {
    console.log("emitting REQUEST_STATE");
    const state: SocketStateUpdate = await this.socket.emitWithAck("REQUEST_STATE");
    console.log(state);
    const initialState = getStateFromSnapshot(state);
    this.snapshots.processSnapshot(state);
    this.bus = new EventBus(this.config, initialState, []);
    const computerPlayers = initialState.playerStore.allPlayerIds().filter(id => {
      return initialState.playerStore.get(id).type === HumanOrComputerPlayerType.Computer;
    });
    const gameConfig: GameConfig = {
      initialState,
      gameId: this.gameId,
      computerPlayers,
    };
    this.gameConfig = gameConfig;
  }
  startGame = () => {
    this.socket.emit("START_GAME");
  };
  isStarted() {
    return this.state.started;
  }
  async setup() {
    if (this._initialized) {
      return;
    }
    this.socket.on("disconnect", reason => {
      console.log("socket disconnected", reason);
      this.onSocketDisconnect(reason);
    });
    this.socket.on("SNAPSHOT", this.snapshots.processSnapshot);
    console.log("attempting to parse key");
    await axios.get<OptionalGamePlayer>(`/api/parse-key/${this.key}`).then(resp => {
      this._gamePlayer = resp.data;
    });
    console.log("parsed key", this._gamePlayer);
    await this.getInitialState();
    console.log("got initial state");
    this.socket.on("GAME_EVENT", this.processEvent);
    this.game = new ReadOnlyGame(this.gameConfig, () => this.state);
    if (this.playerId) {
      this.humanInterface = new HumanRemoteInterface(
        this.config,
        this.socket,
        this.counter,
        this.incrementCounter,
        this.startGame,
        () => this.state,
        this.playerId
      );
      this.state.playerStore.withPlayer(this.playerId, player => player.register(this.game));
      this.humanInterface.setup();
    }
    ["Bank_0" as PlayerId, ...this.game.state.playerTurnOrder].forEach(playerId => {
      this.game.state.playerStore.withPlayer(playerId, player => player.register(this.game));
    });
    this._initialized = true;
    this.setReadyState(true);
    // for debugging state only
    (window as any).getState = () => this.state;
  }
}
