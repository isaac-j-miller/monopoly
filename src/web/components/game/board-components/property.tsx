import React from "react";
import styled from "@emotion/styled";
import { Tooltip2 } from "@blueprintjs/popover2";
import { Card } from "@blueprintjs/core";
import { BoardPosition, PositionType, PropertyColor } from "common/board/types";
import { Property, PropertyLevel } from "common/property/types";
import { getRuntimeConfig } from "common/config";
import { PositionInnerProps } from "./generic";
import { PositionBaseDiv } from "./common";

export const colorMap: Record<PropertyColor, string> = {
  [PropertyColor.Blue]: "blue",
  [PropertyColor.Brown]: "brown",
  [PropertyColor.Fuschia]: "fuchsia",
  [PropertyColor.Green]: "darkgreen",
  [PropertyColor.LightBlue]: "darkcyan",
  [PropertyColor.Orange]: "darkorange",
  [PropertyColor.Red]: "red",
  [PropertyColor.Yellow]: "goldenrod",
};

export const ColorBar = styled.div`
  display: flex;
  justify-content: space-around;
  text-align: center;
  vertical-align: middle;
  width: 100%;
  height: 20%;
`;

const RestOfPosition = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 80%;
  div {
    align-items: center;
    display: flex;
    justify-content: space-around;
    text-align: center;
    vertical-align: middle;
  }
`;

const ImprovementEmojiTooltipCard = styled(Card)`
  background: white;
`;

const ImprovementBox = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-around;
  text-align: center;
  vertical-align: middle;
  height: 100%;
  &:hover {
    cursor: pointer;
  }
`;
export const ImprovementEmojiTooltip: React.FC<{ level: PropertyLevel }> = ({ level }) => {
  const config = React.useMemo(() => getRuntimeConfig(), []);
  const improvementEmojis = config.cli.levels[level];
  return (
    <Tooltip2
      content={<ImprovementEmojiTooltipCard>{PropertyLevel[level]}</ImprovementEmojiTooltipCard>}
      placement="bottom"
      fill={true}
    >
      <ImprovementBox>{improvementEmojis}</ImprovementBox>
    </Tooltip2>
  );
};

export const PropertyPosition: React.FC<PositionInnerProps> = ({ emojiBox, position, state }) => {
  const boardPosition = React.useMemo(
    () => state.board.positions[position] as BoardPosition<PositionType.Property>,
    []
  );
  const property = state.propertyStore.get(boardPosition.propertyId) as Property;
  const color = colorMap[property.color];
  return (
    <PositionBaseDiv>
      <ColorBar style={{ backgroundColor: color }}>
        <ImprovementEmojiTooltip level={property.level} />
      </ColorBar>
      <RestOfPosition>
        <div>{property.name}</div>
        {emojiBox}
        <div>${property.basePrice}</div>
        {property.owner !== "Bank_0" && <div>Owner: {property.owner}</div>}
      </RestOfPosition>
    </PositionBaseDiv>
  );
};
