import React from "react";
import { BoardPosition, PositionType } from "common/board/types";
import { assertNever } from "common/util";
import { PositionInnerProps } from "./generic";
import { PropertyPosition } from "./property";
import { RailroadPosition } from "./railroad";
import { UtilityPosition } from "./utility";
import { CornerPosition } from "./corner";
import { CommunityChestPosition } from "./community-chest";
import { ChancePosition } from "./chance";
import { TaxPosition } from "./tax";

export const getPositionComponent = (
  position: BoardPosition<PositionType>
): React.FC<PositionInnerProps> => {
  switch (position.type) {
    case PositionType.Blank:
    case PositionType.GoToJail:
    case PositionType.Jail:
      return CornerPosition;
    case PositionType.Chance:
      return ChancePosition;
    case PositionType.CommunityChest:
      return CommunityChestPosition;
    case PositionType.Tax:
      return TaxPosition;
    case PositionType.Property:
      return PropertyPosition;
    case PositionType.Railroad:
      return RailroadPosition;
    case PositionType.Utility:
      return UtilityPosition;
    default:
      assertNever(position.type);
  }
  throw new Error("somehow fell through");
};
