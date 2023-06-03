import { Board } from "common/board/board";
import { getRuntimeConfig } from "common/config";
import { HumanOrComputerPlayerType } from "common/config/types";
import { NoopDecisionMaker } from "common/decision-maker/noop";
import { GameConfig } from "common/game/types";
import { Loan } from "common/loan";
import { Bank } from "common/player/bank";
import { Player } from "common/player/player";
import { SocketStateUpdate } from "common/state/socket";
import { GameState, PlayerId } from "common/state/types";
import { LoanStore } from "common/store/loan-store";
import { PlayerStore } from "common/store/player-store";
import { PropertyStore } from "common/store/property-store";

const runtimeConfig = getRuntimeConfig();

export const getStateFromSnapshot = (snapshot: SocketStateUpdate): GameState => {
  const board = new Board(snapshot.board);
  const propertyStore = new PropertyStore(board);
  const loanStore = new LoanStore(Object.values(snapshot.loans).map(loan => new Loan(loan)));
  const playerStore = new PlayerStore([]);
  const computerPlayers: PlayerId[] = [];
  Object.entries(snapshot.players).forEach(
    ([id, { creditLoans, debtLoans, properties, ...rest }]) => {
      const Cotr = id.startsWith("Player_") ? Player : Bank;
      const player = new Cotr(runtimeConfig, new NoopDecisionMaker(runtimeConfig), id as PlayerId, {
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
  const gameState: GameState = {
    board,
    propertyStore,
    // TODO: implement cards
    chanceCards: [],
    communityChestCards: [],
    currentPlayerTurn: snapshot.currentPlayerTurn,
    loanStore,
    playerStore,
    playerTurnOrder: snapshot.playerTurnOrder,
    turn: snapshot.turn,
    started: snapshot.started,
    isDone: false,
  };
  return gameState;
};
