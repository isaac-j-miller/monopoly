import React from "react";
import { BoardPosition, PositionType } from "common/board/types";
import { PositionInnerProps } from "./generic";
import { PositionBaseDiv } from "./common";

export const ChancePosition: React.FC<PositionInnerProps> = ({ location, position, state }) => {
  const boardPosition = React.useMemo(
    () => state.board.positions[position] as BoardPosition<PositionType.Chance>,
    []
  );
  return (
    <PositionBaseDiv>
      <div>{boardPosition.name}</div>
    </PositionBaseDiv>
  );
};
