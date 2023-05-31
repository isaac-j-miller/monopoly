import React from "react";
import { BoardPosition, PositionType } from "common/board/types";
import { PositionInnerProps } from "./generic";
import { PositionBaseDiv } from "./common";

export const CommunityChestPosition: React.FC<PositionInnerProps> = ({
  location,
  position,
  state,
}) => {
  const boardPosition = React.useMemo(
    () => state.board.positions[position] as BoardPosition<PositionType.CommunityChest>,
    []
  );
  return (
    <PositionBaseDiv>
      <div>{boardPosition.name}</div>
    </PositionBaseDiv>
  );
};
