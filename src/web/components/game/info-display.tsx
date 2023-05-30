import React from "react";
import { SocketProps } from "./socket-props";
import { PlayerId } from "common/state/types";

export type InfoDisplayProps = SocketProps & {
  playerId: PlayerId;
};

export const InfoDisplay: React.FC<InfoDisplayProps> = ({ socket, playerId }) => {
  return <div>Info Display</div>;
};
