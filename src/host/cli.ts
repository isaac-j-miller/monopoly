import { Board } from "common/board/board";
import { defaultBoard } from "common/board/default-board";
import { getRuntimeConfig } from "common/config";
import { BankDecisionMaker } from "common/decision-maker/bank";
import { ComputerDecisionMaker } from "common/decision-maker/computer";
import { HumanDecisionMaker } from "common/decision-maker/human";
import { EventBus } from "common/events/bus";
import { Game } from "common/game";
import { Bank } from "common/player/bank";
import { Player } from "common/player/player";
import { IPlayer } from "common/player/types";
import { GameState } from "common/state/types";
import { LoanStore } from "common/store/loan-store";
import { PlayerStore } from "common/store/player-store";
import { PropertyStore } from "common/store/property-store";
import { getRiskyness } from "common/util";

export async function startMonopolyGame() {
    const config = getRuntimeConfig();
    const board = new Board(defaultBoard);
    const propertyStore = new PropertyStore(board);
    const loanStore = new LoanStore([])
    const playerStore = new PlayerStore([]);
    const humanDecisionMaker = new HumanDecisionMaker(config)
    const humanPlayer = new Player(config, propertyStore, loanStore, playerStore, humanDecisionMaker, getRiskyness(), "Player_0");
    const bankDecisionMaker = new BankDecisionMaker(config)
    const bankPlayer = new Bank(config, propertyStore, loanStore, playerStore, bankDecisionMaker, getRiskyness(), "Bank_0");
    const remainingPlayersCount = config.players.count - 1;
    const computerPlayers: IPlayer[]= [];
    for(let i = 1; i <= remainingPlayersCount; i++) {
        const computerDecisionMaker = new ComputerDecisionMaker(config)
        const player = new Player(config, propertyStore, loanStore, playerStore, computerDecisionMaker, getRiskyness(), `Player_${i}`);
        computerPlayers.push(player)
    }
    const players = [humanPlayer,
        bankPlayer,
        ...computerPlayers]

    const initialState: GameState = {
        playerStore: playerStore,
        playerTurnOrder: [],
        turn: 0,
        currentPlayerTurn: 0,
        communityChestCards: [],
        chanceCards: [],
        loanStore,
        propertyStore,
        board
    }
    const bus = new EventBus(initialState, [])
    const game = new Game(config, bus);
    await game.start()
}