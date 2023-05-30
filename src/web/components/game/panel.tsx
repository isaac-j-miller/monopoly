import React from "react";
import { SocketProps } from "./socket-props";
import { PlayerId } from "common/state/types";

export type PanelProps = SocketProps & {
  playerId: PlayerId;
};

export const Panel: React.FC<PanelProps> = ({ socket, playerId }) => {
  return <div>Panel</div>;
};
