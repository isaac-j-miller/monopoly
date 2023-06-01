import React from "react";
import { BoardPosition, PositionType } from "common/board/types";
import { PositionInnerProps } from "./generic";
import { PositionBaseDiv } from "./common";

export const TaxPosition: React.FC<PositionInnerProps> = ({ emojiBox, position, state }) => {
  const boardPosition = React.useMemo(
    () => state.board.positions[position] as BoardPosition<PositionType.Tax>,
    []
  );
  return (
    <PositionBaseDiv>
      <div>{boardPosition.name}</div>
      {emojiBox}
      <div>Pay ${boardPosition.baseAmount}</div>
    </PositionBaseDiv>
  );
};
