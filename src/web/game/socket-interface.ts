import axios from "axios";
import { Socket } from "socket.io-client";
import { GameState, PlayerId } from "common/state/types";
import { assertIsDefined } from "common/util";
import { OptionalGamePlayer, SerializedGamePlayer } from "common/shared/types";
import { GameEvent } from "common/events/types";
import { EventBus } from "common/events/bus";
import { SocketStateUpdate } from "common/state/socket";
import { Board } from "common/board/board";
import { PlayerStore } from "common/store/player-store";
import { HumanOrComputerPlayerType, RuntimeConfig } from "common/config/types";
import { getRuntimeConfig } from "common/config";
import { LoanStore } from "common/store/loan-store";
import { Loan } from "common/loan";
import { Player } from "common/player/player";
import { PropertyStore } from "common/store/property-store";
import { NoopDecisionMaker } from "common/decision-maker/noop";
import { Bank } from "common/player/bank";
import { GameConfig, IGame } from "common/game/types";
import { HumanRemoteInterface } from "./human-interface";
import { ReadOnlyGame } from "./read-only-game";

export class SocketInterface {
  private _initialized = false;
  private _gamePlayer?: OptionalGamePlayer;
  private bus!: EventBus;
  private config: RuntimeConfig;
  public humanInterface?: HumanRemoteInterface;
  private gameConfig!: GameConfig;
  private game!: IGame;
  constructor(
    readonly socket: Socket,
    private key: SerializedGamePlayer,
    private setReadyState: (state: boolean) => void,
    private counter: () => number,
    private incrementCounter: () => void,
    private readonly onSocketDisconnect: () => void
  ) {
    this.config = getRuntimeConfig();
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
  processEvent = async (event: GameEvent) => {
    this.bus.processEvent(event);
    this.incrementCounter();
  };
  async getInitialState() {
    console.log("emitting REQUEST_STATE");
    const state: SocketStateUpdate = await this.socket.emitWithAck("REQUEST_STATE");
    console.log(state);
    const board = new Board(state.board);
    const propertyStore = new PropertyStore(board);
    const loanStore = new LoanStore(Object.values(state.loans).map(loan => new Loan(loan)));
    const playerStore = new PlayerStore([]);
    const computerPlayers: PlayerId[] = [];
    Object.entries(state.players).forEach(
      ([id, { creditLoans, debtLoans, properties, ...rest }]) => {
        const Cotr = id.startsWith("Player_") ? Player : Bank;
        const player = new Cotr(this.config, new NoopDecisionMaker(this.config), id as PlayerId, {
          ...rest,
          creditLoans: new Set(creditLoans),
          debtLoans: new Set(debtLoans),
          properties: new Set(properties),
        });
        playerStore.set(player);
        if (player.type === HumanOrComputerPlayerType.Computer) {
          computerPlayers.push(player.id);
        }
      }
    );
    const initialState: GameState = {
      board,
      propertyStore,
      // TODO: implement cards
      chanceCards: [],
      communityChestCards: [],
      currentPlayerTurn: state.currentPlayerTurn,
      loanStore,
      playerStore,
      playerTurnOrder: state.playerTurnOrder,
      turn: state.turn,
      started: state.started,
    };
    this.bus = new EventBus(this.config, initialState, []);
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
      this.onSocketDisconnect();
    });
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
    this._initialized = true;
    this.setReadyState(true);
    // for debugging state only
    (window as any).getState = () => this.state;
  }
}
