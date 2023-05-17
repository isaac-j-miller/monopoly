import { Property, PropertyLevel } from "common/property/types";

const defaultLevelValuesMultipliers: Record<PropertyLevel, number> = {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 1.2,
    [PropertyLevel.TwoHouses]: 1.5,
    [PropertyLevel.ThreeHouses]: 1.75,
    [PropertyLevel.FourHouses]: 2,
    [PropertyLevel.Hotel]: 3,
    [PropertyLevel.Skyscraper]: 6
}
const defaultLevelRentsMultipliers: Record<PropertyLevel, number> = {
    [PropertyLevel.Unimproved]: 1,
    [PropertyLevel.OneHouse]: 1.2,
    [PropertyLevel.TwoHouses]: 1.4,
    [PropertyLevel.ThreeHouses]: 1.6,
    [PropertyLevel.FourHouses]: 1.8,
    [PropertyLevel.Hotel]: 2.5,
    [PropertyLevel.Skyscraper]: 4
}

export const defaultRailroadQuantityRents: Record<number, number> = {
    1: 25,
    2: 50,
    3: 100,
    4: 200
}

export const defaultUtilityQuantityRollMultipliers: Record<number, number> = {
    1: 4,
    2: 10
}
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