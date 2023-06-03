import { PositionType, PropertyColor } from "common/board/types";
import { getRuntimeConfig } from "common/config";
import { RuntimeConfig } from "common/config/types";
import { calculateExpectedReturnOnPropertyPerTurn } from "common/events/util";
import { LoanState } from "common/loan/types";
import { GenericProperty, Property, PropertyLevel, Railroad, Utility } from "common/property/types";
import { GameState } from "common/state/types";
import { ILoanStore } from "common/store/types";

const defaultLevelRentsMultipliers: Record<PropertyColor, Record<PropertyLevel, number>> = {
  [PropertyColor.Brown]: {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 5,
    [PropertyLevel.TwoHouses]: 15,
    [PropertyLevel.ThreeHouses]: 45,
    [PropertyLevel.FourHouses]: 80,
    [PropertyLevel.Hotel]: 125,
    [PropertyLevel.Skyscraper]: 375,
  },
  [PropertyColor.LightBlue]: {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 5,
    [PropertyLevel.TwoHouses]: 15,
    [PropertyLevel.ThreeHouses]: 45,
    [PropertyLevel.FourHouses]: 66.67,
    [PropertyLevel.Hotel]: 91.67,
    [PropertyLevel.Skyscraper]: 175,
  },
  [PropertyColor.Fuschia]: {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 5,
    [PropertyLevel.TwoHouses]: 15,
    [PropertyLevel.ThreeHouses]: 45,
    [PropertyLevel.FourHouses]: 62.5,
    [PropertyLevel.Hotel]: 75,
    [PropertyLevel.Skyscraper]: 125,
  },
  [PropertyColor.Orange]: {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 5,
    [PropertyLevel.TwoHouses]: 13.75,
    [PropertyLevel.ThreeHouses]: 37.5,
    [PropertyLevel.FourHouses]: 50,
    [PropertyLevel.Hotel]: 62.5,
    [PropertyLevel.Skyscraper]: 93.75,
  },
  [PropertyColor.Red]: {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 5,
    [PropertyLevel.TwoHouses]: 13.89,
    [PropertyLevel.ThreeHouses]: 38.89,
    [PropertyLevel.FourHouses]: 48.61,
    [PropertyLevel.Hotel]: 58.33,
    [PropertyLevel.Skyscraper]: 113.89,
  },
  [PropertyColor.Yellow]: {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 5,
    [PropertyLevel.TwoHouses]: 15,
    [PropertyLevel.ThreeHouses]: 36.36,
    [PropertyLevel.FourHouses]: 44.32,
    [PropertyLevel.Hotel]: 52.27,
    [PropertyLevel.Skyscraper]: 97.72,
  },
  [PropertyColor.Green]: {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 5,
    [PropertyLevel.TwoHouses]: 15,
    [PropertyLevel.ThreeHouses]: 34.62,
    [PropertyLevel.FourHouses]: 42.31,
    [PropertyLevel.Hotel]: 49.03,
    [PropertyLevel.Skyscraper]: 87.5,
  },
  [PropertyColor.Blue]: {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 5,
    [PropertyLevel.TwoHouses]: 15,
    [PropertyLevel.ThreeHouses]: 31.42,
    [PropertyLevel.FourHouses]: 37.14,
    [PropertyLevel.Hotel]: 42.86,
    [PropertyLevel.Skyscraper]: 71.43,
  },
};

export const propertyUpgradeCosts: Record<PropertyColor, number> = {
  [PropertyColor.Brown]: 50,
  [PropertyColor.LightBlue]: 50,
  [PropertyColor.Fuschia]: 100,
  [PropertyColor.Orange]: 100,
  [PropertyColor.Red]: 150,
  [PropertyColor.Yellow]: 150,
  [PropertyColor.Green]: 200,
  [PropertyColor.Blue]: 200,
};

export const defaultRailroadQuantityRents: Record<number, number> = {
  0: 0,
  1: 25,
  2: 50,
  3: 100,
  4: 200,
};

export const defaultUtilityQuantityRollMultipliers: Record<number, number> = {
  0: 0,
  1: 4,
  2: 10,
};

export function updateRailroadValue(railroad: Railroad, state: GameState, config: RuntimeConfig) {
  const marketValue = getPropertyMarketValue(railroad, state, config.runtime.turnsToCountForNPV);
  railroad.realValue = railroad.basePrice;
  railroad.marketValue = marketValue;
}
export function updateUtilityValue(utility: Utility, state: GameState, config: RuntimeConfig) {
  const marketValue = getPropertyMarketValue(utility, state, config.runtime.turnsToCountForNPV);
  utility.realValue = utility.basePrice;
  utility.marketValue = marketValue;
}

export function updatePropertyValue(property: Property, state: GameState, config: RuntimeConfig) {
  const realValue = getPropertyRealValue(property);
  const marketValue = getPropertyMarketValue(property, state, config.runtime.turnsToCountForNPV);
  const rent = getPropertyRent(property.baseRent, property.level, property.color);
  property.realValue = realValue;
  property.marketValue = marketValue;
  property.currentRent = rent;
}

export function getPropertyRealValue(property: Property): number {
  const sunkMoney = propertyUpgradeCosts[property.color] * property.level;
  const baseValue = property.basePrice;
  return baseValue + sunkMoney;
}
export function getPropertyMarketValue(
  property: GenericProperty,
  state: GameState,
  turnsToCount: number
): number {
  const sunkMoney =
    property.propertyType === PositionType.Property
      ? propertyUpgradeCosts[property.color] * property.level
      : 0;
  const baseValue = property.basePrice;
  const discountedCashFlow = getPropertyDiscountedCashFlow(property, state);
  return baseValue + sunkMoney + discountedCashFlow * turnsToCount;
}
const config = getRuntimeConfig();
export function getCurrentAverageInterestRate(loans: LoanState[], weighted = true): number {
  let sum = 0;
  let count = 0;
  loans.forEach(loan => {
    const balance = loan.remainingPrincipal + loan.remainingInterest;
    if (balance <= 0) {
      return;
    }
    const wt = weighted ? balance : 1;
    const weightedValue = wt * loan.rate;
    sum += weightedValue;
    count += wt;
  });
  if (count === 0) {
    return config.bank.startingInterestRate;
  }
  return sum / count;
}

export function getPropertyDiscountedCashFlow(property: GenericProperty, state: GameState): number {
  const anticipatedRentPerTurn = calculateExpectedReturnOnPropertyPerTurn(
    state,
    property.propertyId,
    property.owner
  );
  const avgInterestRate = getCurrentAverageInterestRate(state.loanStore.all());
  const costOfMoney = 1 + avgInterestRate;
  const discountedCashFlow = anticipatedRentPerTurn / costOfMoney;
  // TODO: check that this makes sense
  return discountedCashFlow;
}

export function getPropertyRent(
  baseRent: number,
  level: PropertyLevel,
  color: PropertyColor
): number {
  return baseRent * defaultLevelRentsMultipliers[color][level];
}

export function getUpgradeCost(property: Property, newLevel: PropertyLevel): number {
  const previousLevel = property.level;
  const levelDiff = newLevel - previousLevel;
  const buildingCostPerLevel = propertyUpgradeCosts[property.color];
  return buildingCostPerLevel * levelDiff;
}
