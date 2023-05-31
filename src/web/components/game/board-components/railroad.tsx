import React from "react";
import { BoardPosition, PositionType } from "common/board/types";
import { Railroad } from "common/property/types";
import { PositionInnerProps } from "./generic";
import { PositionBaseDiv } from "./common";

export const RailroadPosition: React.FC<PositionInnerProps> = ({ location, position, state }) => {
  const boardPosition = React.useMemo(
    () => state.board.positions[position] as BoardPosition<PositionType.Property>,
    []
  );
  const property = state.propertyStore.get(boardPosition.propertyId) as Railroad;
  const { orientation } = location;
  return (
    <PositionBaseDiv>
      <div>{property.name}</div>
      <div>${property.basePrice}</div>
    </PositionBaseDiv>
  );
};
