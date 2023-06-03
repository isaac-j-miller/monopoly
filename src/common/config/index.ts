import chalk from "chalk";
import { CreditRating } from "common/state/types";
import { PropertyLevel } from "common/property/types";
import { PropertyColor } from "common/board/types";
import { HumanOrComputerPlayerType, RuntimeConfig } from "./types";

export function getRuntimeConfig(): RuntimeConfig {
  const config: RuntimeConfig = {
    bank: {
      startingInterestRate: 0.05,
      startingMoney: 5e3,
      riskiness: 0,
      emoji: "🏦",
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
        [CreditRating.D]: 0.4,
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
        [CreditRating.D]: 2.5,
      },
    },
    jail: {
      duration: 3,
      getOfJailBaseCost: 50,
    },
    runtime: {
      turnLimit: 500,
      minTurnDuration: 100,
      maxCreditChainDepth: 3,
      passGoAmount: 200,
      maxLeverage: 15,
      minLoanTerm: 5,
      maxLoanTerm: 40,
    },
    players: {
      count: 8,
      initialState: {
        isBankrupt: false,
        cashOnHand: 1000,
        creditLimit: 10000,
        creditLoans: new Set(),
        creditRating: CreditRating.A,
        creditRatingLendingThreshold: CreditRating.B,
        debtLoans: new Set(),
        getOutOfJailFreeCards: 0,
        inJail: false,
        inJailSince: null,
        mostRecentRoll: null,
        netWorth: 1000,
        position: 0,
        properties: new Set(),
        emoji: "PLACEHOLDER",
        riskiness: 0.5,
        type: HumanOrComputerPlayerType.Computer,
      },
      emojiPool: ["👨", "🤖", "🎃", "👻", "😈", "🧚‍♀️", "👽", "🤠", "🤡", "🤑"],
      colorPool: [
        "#3500CA",
        "#FF2813",
        "#FFB000",
        "#00B600",
        "#6C3CBC",
        "#53270B",
        "#000000",
        "#003300",
        "#666699",
        "#ff66ff",
      ],
    },
    cli: {
      board: {
        cornerPositionSize: 15,
        nonCornerPositionHeight: 15,
        nonCornerPositionWidth: 15,
        colors: {
          [PropertyColor.Blue]: chalk.blue,
          [PropertyColor.Brown]: chalk.hex("#964B00"),
          [PropertyColor.Fuschia]: chalk.magenta,
          [PropertyColor.Green]: chalk.green,
          [PropertyColor.LightBlue]: chalk.cyan,
          [PropertyColor.Orange]: chalk.hex("#FFA500"),
          [PropertyColor.Red]: chalk.red,
          [PropertyColor.Yellow]: chalk.yellow,
        },
      },
      levels: {
        [PropertyLevel.Unimproved]: "🚧",
        [PropertyLevel.OneHouse]: "🏠",
        [PropertyLevel.TwoHouses]: "🏠🏠",
        [PropertyLevel.ThreeHouses]: "🏠🏠🏠",
        [PropertyLevel.FourHouses]: "🏠🏠🏠🏠",
        [PropertyLevel.Hotel]: "🏨",
        [PropertyLevel.Skyscraper]: "🏢",
      },
    },
  };
  return config;
}
