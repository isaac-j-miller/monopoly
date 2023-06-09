import React from "react";
import styled from "@emotion/styled";
import { Popover2 } from "@blueprintjs/popover2";
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
  clickComponent: React.FC<PositionInnerProps> | null;
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
  background: transparent;
  &:hover {
    box-shadow: 0 0 20px black inset;
    cursor: pointer;
  }
`;

export const GenericPosition: React.FC<GenericPositionProps> = ({
  child,
  clickComponent,
  ...props
}) => {
  const { position, size, orientation } = React.useMemo(
    () => props.boardSize.getOrientationPositionAndSizeFromPosition(props.position),
    [props.position, props.position, props.boardSize.positions]
  );
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const emojiBox = React.useMemo(
    () =>
      EmojiBox({
        position: props.position,
        state: props.state,
        counter: props.counter,
      }),
    [props.counter]
  );
  const childProps: PositionInnerProps = {
    location: { position, orientation, size },
    position: props.position,
    state: props.state,
    emojiBox,
  };
  const childComponent = child(childProps);
  return (
    <PositionBox
      className={`orientation_${orientation}`}
      style={{
        top: position.y + "px",
        left: position.x + "px",
        width: size.x + "px",
        height: size.y + "px",
      }}
      onClick={() => setPopoverOpen(true)}
    >
      {clickComponent ? (
        <Popover2
          isOpen={popoverOpen}
          onClose={() => setPopoverOpen(false)}
          content={clickComponent(childProps) as JSX.Element}
        >
          {childComponent}
        </Popover2>
      ) : (
        childComponent
      )}
    </PositionBox>
  );
};
