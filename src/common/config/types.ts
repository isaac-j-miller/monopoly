import { Chalk } from "chalk";
import { PropertyColor } from "common/board/types";
import { PropertyLevel } from "common/property/types";
import { CreditRating, PlayerId, PlayerState } from "common/state/types";

export type RuntimeConfig = {
  runtime: {
    minTurnDuration: number;
    turnLimit: number | null;
    maxCreditChainDepth: number;
    passGoAmount: number;
    maxLeverage: number;
    maxLoanTerm: number;
    minLoanTerm: number;
  };
  players: {
    count: number;
    initialState: PlayerState;
    emojiPool: string[];
    colorPool: string[];
  };
  bank: {
    startingMoney: number;
    startingInterestRate: number;
    riskiness: number;
    emoji: string;
  };
  credit: {
    ratingMultiplierOnInterest: Record<CreditRating, number>;
    ratingMultiplierOnDebtAssetValue: Record<CreditRating, number>;
  };
  jail: {
    duration: number;
    getOfJailBaseCost: number;
  };
  cli: {
    board: {
      nonCornerPositionHeight: number;
      nonCornerPositionWidth: number;
      cornerPositionSize: number;
      colors: Record<PropertyColor, Chalk>;
    };
    levels: Record<PropertyLevel, string>;
  };
};

export enum HumanOrComputerPlayerType {
  Human,
  Computer,
}

export type PlayerConfigParams = {
  id: PlayerId;
  // TODO: add name and emoji
  type: HumanOrComputerPlayerType;
};
export type GameConfigParams = {
  players: PlayerConfigParams[];
  bank: {
    startingMoney: number;
    startingInterestRate: number;
    riskiness: number;
  };
};
