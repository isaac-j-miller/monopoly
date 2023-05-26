import { GameState } from "common/state/types";
import { PositionType } from "common/board/types";
import {
  defaultUtilityQuantityRollMultipliers,
  defaultRailroadQuantityRents,
} from "common/property/upgrades";
import { assertIsDefined, assertNever } from "common/util";
import { RentPaymentEvent } from "./types";

export const determineRentPaymentAmount = (
  event: Omit<RentPaymentEvent, "turn" | "order">,
  state: GameState
): number => {
  const { propertyId, player } = event;
  const property = state.propertyStore.get(propertyId);
  const renter = state.playerStore.get(player);
  const owner = state.playerStore.get(property.owner);
  switch (property.propertyType) {
    case PositionType.Property: {
      const othersOfColor = state.board.getAllPropertiesOfColor(property.color);
      const ownerHasAllOfColor = othersOfColor.every(v => {
        const p = state.propertyStore.get(v.propertyId);
        return p.owner === owner.id;
      });
      const rent = property.currentRent;
      if (ownerHasAllOfColor) {
        return rent * 2;
      }
      return rent;
    }
    case PositionType.Utility:
    case PositionType.Railroad: {
      const allPropertiesOfType = state.board.getAllPositionsOfType(property.propertyType);
      const allOfTypeOwnedBySameOwner = allPropertiesOfType.filter(v => {
        const p = state.propertyStore.get(v.propertyId);
        return p.owner === owner.id;
      });
      const numberOfTypeOwnedByOwner = allOfTypeOwnedBySameOwner.length;
      if (property.propertyType === PositionType.Railroad) {
        return defaultRailroadQuantityRents[numberOfTypeOwnedByOwner];
      }
      const { mostRecentRoll } = renter;
      assertIsDefined(mostRecentRoll);
      const rollTotal = mostRecentRoll[0] + mostRecentRoll[1];
      return defaultUtilityQuantityRollMultipliers[numberOfTypeOwnedByOwner] * rollTotal;
    }
    default:
      assertNever(property);
  }
  throw new Error("somehow fell through");
};
