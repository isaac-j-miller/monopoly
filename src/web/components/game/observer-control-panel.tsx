import React from "react";
import { Button, Card } from "@blueprintjs/core";
import { HorizontalDiv, VerticalDiv } from "../common/flex";

type ControlPanelProps = {
  onStartGame: () => void;
  isStarted: boolean;
  counter: number;
};

export const ObserverControlPanel: React.FC<ControlPanelProps> = ({ isStarted, onStartGame }) => {
  return (
    <Card>
      <VerticalDiv>
        <HorizontalDiv>
          <h2 className="bp4-heading">Observer Control Panel</h2>
          {!isStarted && <Button onClick={() => onStartGame()}>Start Game</Button>}
        </HorizontalDiv>
      </VerticalDiv>
    </Card>
  );
};
