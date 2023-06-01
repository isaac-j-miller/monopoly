import React from "react";
import { BoardPosition, PositionType } from "common/board/types";
import { PositionInnerProps } from "./generic";
import { PositionBaseDiv } from "./common";

export const CornerPosition: React.FC<PositionInnerProps> = ({ emojiBox, position, state }) => {
  const boardPosition = React.useMemo(
    () => state.board.positions[position] as BoardPosition<PositionType>,
    []
  );
  return (
    <PositionBaseDiv>
      <div>{boardPosition.name}</div>
      {emojiBox}
    </PositionBaseDiv>
  );
};
