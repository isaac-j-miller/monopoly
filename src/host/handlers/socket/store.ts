import { Server } from "socket.io";
import { IGame, GameConfig } from "common/game/types";
import { Player } from "common/player/player";
import { GameConfigParams, HumanOrComputerPlayerType, RuntimeConfig } from "common/config/types";
import { CreditRating, GameState, PlayerId, PlayerState } from "common/state/types";
import { Game } from "common/game";
import { EventBus } from "common/events/bus";
import { getUniqueId } from "common/util";
import { Board } from "common/board/board";
import { defaultBoard } from "common/board/default-board";
import { PropertyStore } from "common/store/property-store";
import { LoanStore } from "common/store/loan-store";
import { PlayerStore } from "common/store/player-store";
import { IPlayer } from "common/player/types";
import { BankDecisionMaker } from "common/decision-maker/bank";
import { Bank } from "common/player/bank";
import { ComputerDecisionMaker } from "common/decision-maker/computer";
import { SocketIOHumanDecisionMaker } from "./socketio-human";
import { GameSocket } from "./game";
import { SocketIOGameDisplay } from "./socketio-display";

type RecordEntry = {
  game: IGame;
  params: GameConfigParams;
  display: SocketIOGameDisplay;
};

export class GameStore {
  private games: Record<string, RecordEntry>;
  constructor(private config: RuntimeConfig, private readonly io: Server) {
    this.games = {};
  }
  getGame(id: string): IGame | undefined {
    return this.games[id]?.game;
  }
  getGameOriginalParams(id: string): GameConfigParams | undefined {
    return this.games[id]?.params;
  }
  getDisplay(id: string): SocketIOGameDisplay | undefined {
    return this.games[id]?.display;
  }
  getGameConfig(params: GameConfigParams): GameConfig {
    const gameId = getUniqueId();
    const board = new Board(defaultBoard);
    const propertyStore = new PropertyStore(board);
    const loanStore = new LoanStore([]);
    const playerStore = new PlayerStore([]);
    const bankDecisionMaker = new BankDecisionMaker(this.config);
    const bankState: PlayerState = {
      ...this.config.players.initialState,
      cashOnHand: Number.POSITIVE_INFINITY,
      creditRating: CreditRating.AAA,
      riskiness: params.bank.riskiness,
      emoji: this.config.bank.emoji,
    };
    const bankPlayer = new Bank(
      this.config,
      propertyStore,
      loanStore,
      playerStore,
      bankDecisionMaker,
      "Bank_0",
      bankState
    );

    const players: IPlayer[] = [bankPlayer];
    params.players.forEach(({ id, type }, i) => {
      if (type === HumanOrComputerPlayerType.Human) {
        return;
      }
      const computerDecisionMaker = new ComputerDecisionMaker(this.config);
      const playerState: PlayerState = {
        ...this.config.players.initialState,
        cashOnHand: params.bank.startingMoney,
        emoji: this.config.players.emojiPool[i + 1],
        type,
      };
      const player = new Player(
        this.config,
        propertyStore,
        loanStore,
        playerStore,
        computerDecisionMaker,
        id,
        playerState
      );
      players.push(player);
    });
    players.forEach(player => {
      playerStore.add(player);
    });
    const initialState: GameState = {
      playerStore: playerStore,
      playerTurnOrder: params.players.map(p => p.id),
      turn: 0,
      currentPlayerTurn: 0,
      communityChestCards: [],
      chanceCards: [],
      loanStore,
      propertyStore,
      board,
    };
    return {
      gameId,
      initialState,
    };
  }
  createGame(params: GameConfigParams): string {
    const config = this.getGameConfig(params);
    const bus = new EventBus(this.config, config.initialState);
    const display = new SocketIOGameDisplay(this.io, config.gameId);
    const game = new Game(this.config, bus, config);
    display.register(game);
    const entry: RecordEntry = {
      display,
      game,
      params,
    };
    this.games[config.gameId] = entry;
    return config.gameId;
  }
  registerPlayer(gameId: string, playerId: PlayerId, socket: GameSocket, state: PlayerState) {
    const game = this.getGame(gameId);
    if (!game) {
      throw new Error(`no game with ID ${gameId}`);
    }
    const decisionMaker = new SocketIOHumanDecisionMaker(this.config, socket);
    const player = new Player(
      this.config,
      game.state.propertyStore,
      game.state.loanStore,
      game.state.playerStore,
      decisionMaker,
      playerId,
      state
    );
    game.addPlayer(player);
  }
}
