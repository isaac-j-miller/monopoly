import React from "react";
import { PlayerId } from "common/state/types";
import { SocketProps } from "./socket-props";
import { Navbar, Tab, Tabs } from "@blueprintjs/core";
import { PlayerTab } from "./tabs/player";
import { EconomyTab } from "./tabs/economy";
import { PropertyTab } from "./tabs/property";
import { LoansTab } from "./tabs/loans";

export type PanelProps = SocketProps & {
  playerId: PlayerId | null;
  counter: number;
};

export const Panel: React.FC<PanelProps> = ({ socket, playerId, counter }) => {
  // const [tab, setTab] = React.useState()
  return (
    <Navbar>
      <Navbar.Group>
        <Tabs animate={true} fill={true} large={true}>
          <Tab title="Player" id="playertab" panel={<PlayerTab counter={counter} socket={socket} />} />
          <Tab title="Economy" id="economyttab" panel={<EconomyTab counter={counter} socket={socket} />} />
          <Tab title="Property" id="propertytab" panel={<PropertyTab counter={counter} socket={socket} />} />
          <Tab title="Loans" id="loanstab" panel={<LoansTab counter={counter} socket={socket} />} />
          <Tabs.Expander />
        </Tabs>
      </Navbar.Group>
    </Navbar>
  );
};
