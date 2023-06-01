import React from "react";
import { SocketProps } from "./socket-props";
import { PlayerId } from "common/state/types";
import styled from "@emotion/styled";
import { Navbar, Tab, Tabs } from "@blueprintjs/core";
import { PlayerTab } from "./tabs/player";
import { EconomyTab } from "./tabs/economy";
import { PropertyTab } from "./tabs/property";
import { LoansTab } from "./tabs/loans";

export type PanelProps = SocketProps & {
  playerId: PlayerId;
  counter: number;
};

export const Panel: React.FC<PanelProps> = ({ socket, playerId }) => {
  // const [tab, setTab] = React.useState()
  return (
    <Navbar>
      <Navbar.Group>
        <Tabs animate={true} fill={true} large={true}>
          <Tab title="Player" id="playertab" panel={<PlayerTab socket={socket} />} />
          <Tab title="Economy" id="economyttab" panel={<EconomyTab socket={socket} />} />
          <Tab title="Property" id="propertytab" panel={<PropertyTab socket={socket} />} />
          <Tab title="Loans" id="loanstab" panel={<LoansTab socket={socket} />} />
          <Tabs.Expander />
        </Tabs>
      </Navbar.Group>
    </Navbar>
  );
};
