import React from "react";
import styled from "@emotion/styled";
import { GameState } from "common/state/types";
import { EmojiBox } from "./emoji-box";
import { BoardSize, OrientationPositionAndSize } from "./board-size";

export type PositionBoardLength = {
  position: number;
  boardSize: BoardSize;
};

export type GenericPositionProps = PositionBoardLength & {
  child: React.FC<PositionInnerProps>;
  state: GameState;
  counter: number;
};

export type PositionInnerProps = {
  state: GameState;
  location: OrientationPositionAndSize;
  position: number;
  emojiBox: React.ReactNode;
};

export const PositionBox = styled.div`
  display: block;
  position: absolute;
  padding: 0.5px;
`;

export const GenericPosition: React.FC<GenericPositionProps> = ({ child, ...props }) => {
  const { position, size, orientation } = React.useMemo(
    () => props.boardSize.getOrientationPositionAndSizeFromPosition(props.position),
    [props.position, props.position, props.boardSize.positions]
  );
  const emojiBox = React.useMemo(
    () =>
      EmojiBox({
        position: props.position,
        state: props.state,
        counter: props.counter,
      }),
    [props.counter]
  );
  return (
    <PositionBox
      className={`orientation_${orientation}`}
      style={{
        top: position.y + "px",
        left: position.x + "px",
        width: size.x + "px",
        height: size.y + "px",
      }}
    >
      {child({
        location: { position, orientation, size },
        position: props.position,
        state: props.state,
        emojiBox,
      })}
    </PositionBox>
  );
};
