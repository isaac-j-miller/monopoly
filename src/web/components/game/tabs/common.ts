import styled from "@emotion/styled";
import { SocketInterface } from "src/web/game/socket-interface";

export type TabProps = {
  socket: SocketInterface;
  counter: number;
};

export const TabRoot = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`;

export const GraphsContainer = styled.div`
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
`;
