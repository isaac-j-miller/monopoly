import React from "react";
import { BoardPosition, PositionType } from "common/board/types";
import { Property } from "common/property/types";
import { getPlayerNameGenerator } from "common/formatters/player";
import { PropertyCard } from "../../cards/property-card";
import { PositionInnerProps } from "../generic";

export const PropertyClickComponent: React.FC<PositionInnerProps> = ({ state, position }) => {
  const pos = state.board.positions[position] as BoardPosition<PositionType.Property>;
  const property = state.propertyStore.get(pos.propertyId) as Property;
  const nameGenerator = React.useMemo(() => getPlayerNameGenerator(state.playerStore), []);
  return <PropertyCard state={state} property={property} nameGenerator={nameGenerator} />;
};
