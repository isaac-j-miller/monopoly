import React from "react";
import { Table2, Column } from "@blueprintjs/table";
import { TabProps, TabRoot } from "./common";

export const PlayerTab: React.FC<TabProps> = ({ socket }) => {
  return (
    <TabRoot>
      <h2 className="bp4-heading">{socket.playerId}</h2>
      <Table2>
        <Column />
        <Column />
        <Column />
        <Column />
        <Column />
      </Table2>
    </TabRoot>
  );
};
