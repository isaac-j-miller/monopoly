import { Chalk } from "chalk";
import { PropertyColor } from "common/board/types";
import { CreditRating, PlayerState } from "common/state/types";

export type RuntimeConfig = {
  minTurnDuration: number;
  turnLimit: number | null;
  players: {
    count: number;
    initialState: PlayerState;
  };
  bank: {
    startingMoney: number;
    startingInterestRate: number;
    riskiness: number;
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
  };
};
