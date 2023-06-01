import React from "react";
import styled from "@emotion/styled";
import { BoardPosition, PositionType, PropertyColor } from "common/board/types";
import { Property } from "common/property/types";
import { PositionInnerProps } from "./generic";
import { PositionBaseDiv } from "./common";
import { getRuntimeConfig } from "common/config";

const colorMap: Record<PropertyColor, string> = {
  [PropertyColor.Blue]: "blue",
  [PropertyColor.Brown]: "brown",
  [PropertyColor.Fuschia]: "fuchsia",
  [PropertyColor.Green]: "darkgreen",
  [PropertyColor.LightBlue]: "darkcyan",
  [PropertyColor.Orange]: "darkorange",
  [PropertyColor.Red]: "red",
  [PropertyColor.Yellow]: "goldenrod",
};

const ColorBar = styled.div`
  display: block;
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

export const PropertyPosition: React.FC<PositionInnerProps> = ({ emojiBox, position, state }) => {
  const boardPosition = React.useMemo(
    () => state.board.positions[position] as BoardPosition<PositionType.Property>,
    []
  );
  const config = React.useMemo(() => getRuntimeConfig(), []);
  const property = state.propertyStore.get(boardPosition.propertyId) as Property;
  const color = colorMap[property.color];
  const improvementEmojis = config.cli.levels[property.level];
  return (
    <PositionBaseDiv>
      <ColorBar style={{ backgroundColor: color }}>{improvementEmojis}</ColorBar>
      <RestOfPosition>
        <div>{property.name}</div>
        {emojiBox}
        <div>${property.basePrice}</div>
      </RestOfPosition>
    </PositionBaseDiv>
  );
};
