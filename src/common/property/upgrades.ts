import { PropertyColor } from "common/board/types";
import { Property, PropertyLevel } from "common/property/types";

const defaultLevelValuesMultipliers: Record<PropertyLevel, number> = {
  [PropertyLevel.Unimproved]: 1,
  [PropertyLevel.OneHouse]: 2,
  [PropertyLevel.TwoHouses]: 3,
  [PropertyLevel.ThreeHouses]: 4,
  [PropertyLevel.FourHouses]: 5,
  [PropertyLevel.Hotel]: 10,
  [PropertyLevel.Skyscraper]: 15,
};
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
export function getPropertyRealValue(baseValue: number, level: PropertyLevel): number {
  return baseValue * defaultLevelValuesMultipliers[level];
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
  const currentValue = getPropertyRealValue(property.basePrice, previousLevel);
  const newValue = getPropertyRealValue(property.basePrice, newLevel);
  return newValue - currentValue;
}
