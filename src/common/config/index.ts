import { CreditRating } from "common/state/types"
import { RuntimeConfig } from "./types"

export function getRuntimeConfig(): RuntimeConfig {
    const config: RuntimeConfig = {
        bank: {
            startingInterestRate: 0.05,
            startingMoney: 10000,
            riskiness: 0
        },
        credit: {
            ratingMultiplierOnDebtAssetValue: {
                [CreditRating.AAA]: 1,
                [CreditRating.AA]: 0.99,
                [CreditRating.A]: 0.95,
                [CreditRating.BBB]: 0.9,
                [CreditRating.BB]: 0.87,
                [CreditRating.B]: 0.85,
                [CreditRating.CCC]: 0.8,
                [CreditRating.CC]: 0.7,
                [CreditRating.C]: 0.6,
                [CreditRating.D]: 0.4
            },
            ratingMultiplierOnInterest: {
                [CreditRating.AAA]: 0.8,
                [CreditRating.AA]: 0.9,
                [CreditRating.A]: 1,
                [CreditRating.BBB]: 1.1,
                [CreditRating.BB]: 1.2,
                [CreditRating.B]: 1.3,
                [CreditRating.CCC]: 1.6,
                [CreditRating.CC]: 1.8,
                [CreditRating.C]: 2,
                [CreditRating.D]: 2.5
            }
        },
        jail: {
            duration: 3,
            getOfJailBaseCost: 50
        },
        minTurnDuration: 100,
        players: {
            count: 8,
            initialState: {
                cashOnHand: 800,
                creditLoans: new Set(),
                creditRating: CreditRating.A,
                creditRatingLendingThreshold: CreditRating.B,
                debtLoans: new Set(),
                getOutOfJailFreeCards: 0,
                inJail: false,
                inJailSince: null,
                mostRecentRoll: null,
                netWorth: 800,
                position: 0,
                properties: new Set(),
            }
        },
        turnLimit: 500
    }
    return config
}