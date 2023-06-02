import io from "socket.io-client";
import React, { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Alignment, Button, Drawer, Navbar, Spinner } from "@blueprintjs/core";
import type { SerializedGamePlayer } from "common/shared/types";
import { SocketInterface } from "../game/socket-interface";
import { GameLayout } from "../components/game/layout";
import { GameBoard } from "../components/game/board";
import { ControlPanel } from "../components/game/control-panel";
import { Panel } from "../components/game/panel";
import { HorizontalDiv } from "../components/common/flex";

export const Game: React.FC = () => {
  const { id } = useParams<{ id: SerializedGamePlayer }>();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [counter, setCounter] = React.useState<number>(0);
  const incrementCounter = () => {
    setCounter(c => {
      return c + 1;
    });
  };
  const onDisconnect = () => {
    const idx = window.location.href.indexOf("/game/");
    const newHref = window.location.href.slice(0, idx);
    console.log("redirecting", newHref);
    window.location.href = newHref;
  };
  const socket = useMemo(() => {
    if (!id) {
      throw new Error("no id param");
    }
    const s = io({
      query: { id },
    });
    const si = new SocketInterface(s, id, setReady, () => counter, incrementCounter, onDisconnect);
    void si.setup();
    return si;
  }, [id]);

  return (
    <GameLayout>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Button icon="menu" onClick={() => setDrawerOpen(!drawerOpen)}></Button>
          <Navbar.Divider />
          <Navbar.Heading>Monopoly!</Navbar.Heading>
        </Navbar.Group>
      </Navbar>
      {ready ? (
        <HorizontalDiv>
          <ControlPanel remote={socket.humanInterface} counter={counter} />
          <GameBoard socket={socket} counter={counter} />
          <Drawer onClose={() => setDrawerOpen(false)} isOpen={drawerOpen}>
            <Panel counter={counter} socket={socket} playerId={socket.playerId}></Panel>
          </Drawer>
        </HorizontalDiv>
      ) : (
        <Spinner />
      )}
    </GameLayout>
  );
};
