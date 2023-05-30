import io from "socket.io-client";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "@blueprintjs/core";
import type { SerializedGamePlayer } from "common/shared/types";
import { SocketInterface } from "../game/socket-interface";
import { GameLayout } from "../components/game/layout";
import { GameBoard } from "../components/game/board";
import { InfoDisplay } from "../components/game/info-display";
import { Panel } from "../components/game/panel";
import { HorizontalDiv, VerticalDiv } from "../components/common/flex";

export const Game: React.FC = () => {
  const { id } = useParams<{ id: SerializedGamePlayer }>();
  const [ready, setReady] = React.useState(false);
  if (!id) {
    throw new Error("no id param");
  }
  const socket = useMemo(() => {
    const s = io({
      query: { id },
    });
    const si = new SocketInterface(s, id, setReady);
    void si.setup();
    return si;
  }, [id]);

  return (
    <GameLayout>
      {ready ? (
        <HorizontalDiv>
          <VerticalDiv>
            <GameBoard socket={socket} />
            <InfoDisplay socket={socket} playerId={socket.playerId} />
          </VerticalDiv>
          <Panel socket={socket} playerId={socket.playerId}></Panel>
        </HorizontalDiv>
      ) : (
        <Spinner />
      )}
    </GameLayout>
  );
};
