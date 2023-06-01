import { Card } from "@blueprintjs/core";
import styled from "@emotion/styled";
import { SocketInterface } from "src/web/game/socket-interface";

export type TabProps = {
  socket: SocketInterface;
};

export const TabRoot = styled(Card)`
  display: flex;
  flex-direction: column;
  overflow-x: auto;
`;
