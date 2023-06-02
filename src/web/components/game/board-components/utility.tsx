import React from "react";
import { BoardPosition, PositionType } from "common/board/types";
import { Utility } from "common/property/types";
import { PositionInnerProps } from "./generic";
import { PositionBaseDiv } from "./common";

export const UtilityPosition: React.FC<PositionInnerProps> = ({ emojiBox, position, state }) => {
  const boardPosition = React.useMemo(
    () => state.board.positions[position] as BoardPosition<PositionType.Property>,
    []
  );
  const property = state.propertyStore.get(boardPosition.propertyId) as Utility;
  return (
    <PositionBaseDiv>
      <div>{property.name}</div>
      {emojiBox}
      <div>${property.basePrice}</div>
      {property.owner !== "Bank_0" && <div>Owner: {property.owner}</div>}
    </PositionBaseDiv>
  );
};
