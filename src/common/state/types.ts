import { IBoard, PositionType, PropertyColor } from "common/board/types";
import { ChanceCard, CommunityChestCard } from "common/cards/types";
import { LoanId } from "common/loan/types";
import { IPlayer } from "common/player/types";
import { ILoanStore, IPlayerStore, IPropertyStore } from "common/store/types";


export enum InterestRateType {
    Fixed,
    Variable
}

export enum CreditRating {
    D,
    C,
    CC,
    CCC,
    B,
    BB,
    BBB,
    A,
    AA,
    AAA
}

export type PlayerType = "Player" | "Bank";

export type PlayerId = `${PlayerType}_${number}`;


export interface PlayerState {
    position: number;
    inJail: boolean;
    inJailSince: number | null;
    cashOnHand: number;
    creditLoans: Set<LoanId>;
    debtLoans: Set<LoanId>;
    properties: Set<number>;
    netWorth: number;
    creditRating: CreditRating;
    creditRatingLendingThreshold: CreditRating;
    getOutOfJailFreeCards: number;
    mostRecentRoll: [number, number] | null;
}

export interface GameState {
    playerStore: IPlayerStore;
    playerTurnOrder: PlayerId[];
    turn: number;
    currentPlayerTurn: number;
    communityChestCards: CommunityChestCard[];
    chanceCards: ChanceCard[];
    loanStore: ILoanStore;
    propertyStore: IPropertyStore;
    board: IBoard;
}