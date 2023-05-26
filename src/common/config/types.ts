import { Chalk } from "chalk";
import { PropertyColor } from "common/board/types";
import { PropertyLevel } from "common/property/types";
import { CreditRating, PlayerState } from "common/state/types";

export type RuntimeConfig = {
  minTurnDuration: number;
  turnLimit: number | null;
  players: {
    count: number;
    initialState: PlayerState;
    emojiPool: string[];
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
