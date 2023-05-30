import { Server } from "socket.io";
import { IGame, GameConfig } from "common/game/types";
import { Player } from "common/player/player";
import { GameConfigParams, HumanOrComputerPlayerType, RuntimeConfig } from "common/config/types";
import { GameState, PlayerId } from "common/state/types";
import { Game } from "common/game";
import { EventBus } from "common/events/bus";
import { SocketIOHumanDecisionMaker } from "./socketio-human";
import { GameSocket } from "./game";
import { SocketIOGameDisplay } from "./socketio-display";
import { getRiskyness, getUniqueId } from "common/util";
import { Board } from "common/board/board";
import { defaultBoard } from "common/board/default-board";
import { PropertyStore } from "common/store/property-store";
import { LoanStore } from "common/store/loan-store";
import { PlayerStore } from "common/store/player-store";
import { IPlayer } from "common/player/types";
import { BankDecisionMaker } from "common/decision-maker/bank";
import { Bank } from "common/player/bank";
import { ComputerDecisionMaker } from "common/decision-maker/computer";

export class GameStore {
  private games: Record<string, IGame>;
  constructor(private config: RuntimeConfig, private readonly io: Server) {
    this.games = {};
  }
  getGameConfig(params: GameConfigParams): GameConfig {
    const gameId = getUniqueId();
    const board = new Board(defaultBoard);
    const propertyStore = new PropertyStore(board);
    const loanStore = new LoanStore([]);
    const playerStore = new PlayerStore([]);
    const bankDecisionMaker = new BankDecisionMaker(this.config);
    const bankPlayer = new Bank(
      this.config,
      propertyStore,
      loanStore,
      playerStore,
      bankDecisionMaker,
      params.bank.riskiness,
      "Bank_0",
      this.config.bank.emoji,
      HumanOrComputerPlayerType.Computer
    );

    const players: IPlayer[] = [bankPlayer];
    params.players.forEach(({ id, type }, i) => {
      if (type === HumanOrComputerPlayerType.Human) {
        return;
      }
      const computerDecisionMaker = new ComputerDecisionMaker(this.config);
      const player = new Player(
        this.config,
        propertyStore,
        loanStore,
        playerStore,
        computerDecisionMaker,
        getRiskyness(),
        id,
        this.config.players.emojiPool[i + 1],
        type
      );
      players.push(player);
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
  createGame(config: GameConfig): void {
    const bus = new EventBus(this.config, config.initialState);
    const display = new SocketIOGameDisplay(this.io, config.gameId);
    const game = new Game(this.config, bus, display, config);
    this.games[config.gameId] = game;
  }
  registerPlayer(gameId: string, playerId: PlayerId, socket: GameSocket, emoji: string) {
    if (!this.games[gameId]) {
      throw new Error(`no game with ID ${gameId}`);
    }
    const game = this.games[gameId];
    if (game.state.playerStore.get(playerId)) {
      // TODO: maybe handle this better to allow a player to resume a game
      throw new Error("player already exists");
    }
    const decisionMaker = new SocketIOHumanDecisionMaker(this.config, socket);
    const player = new Player(
      this.config,
      game.state.propertyStore,
      game.state.loanStore,
      game.state.playerStore,
      decisionMaker,
      0,
      playerId,
      emoji,
      HumanOrComputerPlayerType.Human
    );
    game.addPlayer(player);
  }
}
