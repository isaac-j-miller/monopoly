import { CreditRating, PlayerState } from "common/state/types";

export type RuntimeConfig = {
    minTurnDuration: number;
    turnLimit: number | null;
    players: {
        count: number;
        initialState: PlayerState
    }
    bank: {
        startingMoney: number;
        startingInterestRate: number;
    }
    credit: {
        ratingMultiplierOnInterest: Record<CreditRating,number>;
    }
    jail: {
        duration: number;
        getOfJailBaseCost: number;
    }
}