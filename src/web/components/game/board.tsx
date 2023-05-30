import React from "react";
import { SocketProps } from "./socket-props";

export type GameBoardProps = SocketProps;

export const GameBoard: React.FC<GameBoardProps> = ({ socket }) => {
  return <div>Game Board</div>;
};
