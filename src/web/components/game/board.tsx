import React from "react";
import styled from "@emotion/styled";
import { SocketProps } from "./socket-props";
import { GenericPosition } from "./board-components/generic";
import { getClickComponent, getPositionComponent } from "./board-components/get-component";
import { BoardSize } from "./board-components/board-size";

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
        const clickComponent = getClickComponent(position);
        return (
          <GenericPosition
            counter={counter}
            boardSize={boardSize}
            clickComponent={clickComponent}
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
