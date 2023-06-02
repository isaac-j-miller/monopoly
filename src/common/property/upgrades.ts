import { Property, PropertyLevel } from "common/property/types";

const defaultLevelValuesMultipliers: Record<PropertyLevel, number> = {
  [PropertyLevel.Unimproved]: 1,
  [PropertyLevel.OneHouse]: 2,
  [PropertyLevel.TwoHouses]: 3,
  [PropertyLevel.ThreeHouses]: 4,
  [PropertyLevel.FourHouses]: 5,
  [PropertyLevel.Hotel]: 7,
  [PropertyLevel.Skyscraper]: 10,
};
const defaultLevelRentsMultipliers: Record<PropertyLevel, number> = {
  [PropertyLevel.Unimproved]: 1,
  [PropertyLevel.OneHouse]: 5,
  [PropertyLevel.TwoHouses]: 15,
  [PropertyLevel.ThreeHouses]: 45,
  [PropertyLevel.FourHouses]: 80,
  [PropertyLevel.Hotel]: 125,
  [PropertyLevel.Skyscraper]: 375,
};

export const defaultRailroadQuantityRents: Record<number, number> = {
  1: 25,
  2: 50,
  3: 100,
  4: 200,
};

export const defaultUtilityQuantityRollMultipliers: Record<number, number> = {
  1: 4,
  2: 10,
};
export function getPropertyRealValue(baseValue: number, level: PropertyLevel): number {
  return baseValue * defaultLevelValuesMultipliers[level];
}
export function getPropertyRent(baseRent: number, level: PropertyLevel): number {
  return baseRent * defaultLevelRentsMultipliers[level];
}
export function getUpgradeCost(property: Property, newLevel: PropertyLevel): number {
  const previousLevel = property.level;
  const currentValue = getPropertyRealValue(property.basePrice, previousLevel);
  const newValue = getPropertyRealValue(property.basePrice, newLevel);
  return newValue - currentValue;
}
