import React from "react";
import { SocketProps } from "./socket-props";
import styled from "@emotion/styled";
import { BoardSize, GenericPosition } from "./board-components/generic";
import { getPositionComponent } from "./board-components/get-component";

export type GameBoardProps = SocketProps & {
  counter: number;
};

const BoardBox = styled.div`
  position: relative;
`;

export const GameBoard: React.FC<GameBoardProps> = ({ socket, counter }) => {
  const boardSize = React.useMemo(
    () => new BoardSize(socket.state.board.positions.length),
    [socket.state.board.positions.length]
  );

  return (
    <BoardBox
      style={{
        width: boardSize.sideLength + "px",
        height: boardSize.sideLength + "px",
      }}
    >
      {socket.state.board.positions.map(position => {
        const component = getPositionComponent(position);
        return (
          <GenericPosition
            counter={counter}
            boardSize={boardSize}
            child={component}
            position={position.position}
            state={socket.state}
            key={`boardposition-${position.position}.${position.type}`}
          />
        );
      })}
    </BoardBox>
  );
};
