import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { Button, Card } from "@blueprintjs/core";
import { CreditRating } from "common/state/types";
import { HorizontalDiv, VerticalDiv } from "../common/flex";
import { HumanRemoteInterface } from "src/web/game/human-interface";
import { getTaskComponent } from "./control-panel-components/task-components";

export type ControlPanelProps = {
  remote: HumanRemoteInterface;
  counter: number;
};

const DiceBox = styled.span`
  width: max-content;
  height: max-content;
  display: flex;
  flex-direction: row;
`;
const Dice = styled.span`
  width: 2em;
  height: 2em;
  margin: 0.5em;
  font-size: 150%;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const RollDisplay: React.FC<{ roll: [number, number] }> = ({ roll }) => {
  return (
    <VerticalDiv>
      <h4 className="bp4-heading">Most Recent Roll</h4>
      <DiceBox>
        <Dice>{roll[0]}</Dice>
        <Dice>{roll[1]}</Dice>
      </DiceBox>
    </VerticalDiv>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = ({ remote }) => {
  const { player } = remote;
  const task = remote.getTask();
  const taskComponent = getTaskComponent(task, remote);
  const currentPosition = remote.gameState().board.positions[player.position];
  return (
    <Card>
      <VerticalDiv>
        <HorizontalDiv>
          <h2 className="bp4-heading">Control Panel</h2>
          {!remote.isStarted() && <Button onClick={() => remote.startGame()}>Start Game</Button>}
        </HorizontalDiv>
        {remote.isCurrentPlayerTurn() && (
          <>
            <h3 className="bp4-header">It is your turn.</h3>
            <h4 className="bp4-header">You are on {currentPosition.name}</h4>
          </>
        )}
        {player.mostRecentRoll && <RollDisplay roll={player.mostRecentRoll} />}
        <p>
          Cash on Hand: $
          {player.cashOnHand.toLocaleString("en-US", {
            currency: "usd",
          })}
        </p>
        <p>Credit Rating: {CreditRating[player.creditRating]}</p>
        <p>
          Net Worth: $
          {player.getNetWorth().toLocaleString("en-US", {
            currency: "usd",
          })}
        </p>
        <p>
          Total Assets: $
          {player.getTotalAssetValue().toLocaleString("en-US", {
            currency: "usd",
          })}
        </p>
        <p>
          Total Liabilities: $
          {player.getTotalLiabilityValue().toLocaleString("en-US", {
            currency: "usd",
          })}
        </p>
        {taskComponent}
      </VerticalDiv>
    </Card>
  );
};
