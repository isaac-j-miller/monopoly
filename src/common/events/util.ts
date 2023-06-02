import { GameState, PlayerId } from "common/state/types";
import { PositionType } from "common/board/types";
import {
  defaultUtilityQuantityRollMultipliers,
  defaultRailroadQuantityRents,
  getPropertyRent,
} from "common/property/upgrades";
import { assertIsDefined, assertNever } from "common/util";
import { GenericProperty, Property, PropertyLevel, Railroad, Utility } from "common/property/types";
import { RentPaymentEvent } from "./types";

const determineRentPaymentAmountForProperty = (
  state: GameState,
  property: Property,
  owner: PlayerId,
  levelOverride?: PropertyLevel
): number => {
  const othersOfColor = state.board.getAllPropertiesOfColor(property.color);
  const ownerHasAllOfColor = othersOfColor.every(v => {
    const p = state.propertyStore.get(v.propertyId);
    return p.owner === owner;
  });
  const level = property.level ?? levelOverride;
  const rent = getPropertyRent(property.baseRent, level);
  if (ownerHasAllOfColor && level === 0) {
    return rent * 2;
  }
  return rent;
};

const determineRentPaymentAmountForRailroad = (
  state: GameState,
  property: Railroad,
  owner: PlayerId
): number => {
  const allPropertiesOfType = state.board.getAllPositionsOfType(property.propertyType);
  const allOfTypeOwnedBySameOwner = allPropertiesOfType.filter(v => {
    const p = state.propertyStore.get(v.propertyId);
    return p.owner === owner;
  });
  const numberOfTypeOwnedByOwner = allOfTypeOwnedBySameOwner.length;
  return defaultRailroadQuantityRents[numberOfTypeOwnedByOwner];
};

const determineRentPaymentAmountForUtility = (
  state: GameState,
  property: Utility,
  owner: PlayerId,
  mostRecentRoll: [number, number]
): number => {
  const allPropertiesOfType = state.board.getAllPositionsOfType(property.propertyType);
  const allOfTypeOwnedBySameOwner = allPropertiesOfType.filter(v => {
    const p = state.propertyStore.get(v.propertyId);
    return p.owner === owner;
  });
  const numberOfTypeOwnedByOwner = allOfTypeOwnedBySameOwner.length;

  const rollTotal = mostRecentRoll[0] + mostRecentRoll[1];
  return defaultUtilityQuantityRollMultipliers[numberOfTypeOwnedByOwner] * rollTotal;
};
export const determineRentPaymentAmount = (
  event: Omit<RentPaymentEvent, "turn" | "order">,
  state: GameState
): number => {
  const { propertyId, player } = event;
  const property = state.propertyStore.get(propertyId);
  const renter = state.playerStore.get(player);
  switch (property.propertyType) {
    case PositionType.Property: {
      return determineRentPaymentAmountForProperty(state, property, property.owner);
    }
    case PositionType.Utility: {
      const { mostRecentRoll } = renter;
      assertIsDefined(mostRecentRoll);
      return determineRentPaymentAmountForUtility(state, property, property.owner, mostRecentRoll);
    }
    case PositionType.Railroad:
      return determineRentPaymentAmountForRailroad(state, property, property.owner);
    default:
      assertNever(property);
  }
  throw new Error("somehow fell through");
};

export const calculateExpectedRentForProperty = (
  state: GameState,
  property: GenericProperty,
  owner: PlayerId
) => {
  switch (property.propertyType) {
    case PositionType.Property:
      return determineRentPaymentAmountForProperty(state, property, owner);
    case PositionType.Railroad:
      return determineRentPaymentAmountForRailroad(state, property, owner);
    case PositionType.Utility:
      return determineRentPaymentAmountForUtility(state, property, owner, [2, 5] as [
        number,
        number
      ]);
    default:
      assertNever(property);
  }
  throw new Error("somehow fell through");
};

export const calculateExpectedReturnOnPropertyPerTurn = (
  state: GameState,
  propertyId: number,
  owner: PlayerId
) => {
  const numberOfPlayersWhoMightRent = state.playerTurnOrder.length - 1;
  const numberOfPositions = state.board.positions.length;
  const avgHitsPerTurn = numberOfPlayersWhoMightRent / numberOfPositions;
  const property = state.propertyStore.get(propertyId);
  const rent = calculateExpectedRentForProperty(state, property, owner);
  const expectedRentPerTurn = avgHitsPerTurn * rent;
  return expectedRentPerTurn;
};
