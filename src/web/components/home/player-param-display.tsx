import React from "react";
import styled from "@emotion/styled";
import { Button, ButtonGroup, Card } from "@blueprintjs/core";
import { HumanOrComputerPlayerType, PlayerConfigParams } from "common/config/types";
import { HorizontalDiv } from "../common/flex";

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export type PlayerConfigParamDisplayProps = {
  data: PlayerConfigParams;
  onChangeType: (type: HumanOrComputerPlayerType) => void;
  onDelete: () => void;
};

export const PlayerConfigParamDisplay: React.FC<PlayerConfigParamDisplayProps> = ({
  data,
  onChangeType,
  onDelete,
}) => {
  return (
    <StyledCard>
      <label>{data.id}</label>
      <ButtonGroup>
        <Button
          onClick={() => {
            if (data.type === HumanOrComputerPlayerType.Human) {
              onChangeType(HumanOrComputerPlayerType.Computer);
            } else {
              onChangeType(HumanOrComputerPlayerType.Human);
            }
          }}
        >
          {HumanOrComputerPlayerType[data.type]}
        </Button>
        <Button onClick={onDelete} icon="delete" />
      </ButtonGroup>
    </StyledCard>
  );
};
