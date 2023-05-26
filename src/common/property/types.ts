import type { PositionType, PropertyColor } from "common/board/types";
import type { PlayerId } from "common/state/types";

export enum PropertyLevel {
  Unimproved,
  OneHouse,
  TwoHouses,
  ThreeHouses,
  FourHouses,
  Hotel,
  Skyscraper,
}
interface PropertyBase {
  propertyId: number;
  owner: PlayerId;
  basePrice: number;
  position: number;
  marketValue: number;
  realValue: number;
  name: string;
  propertyType: PositionType.Property | PositionType.Railroad | PositionType.Utility;
}

export interface Property extends PropertyBase {
  color: PropertyColor;
  level: PropertyLevel;
  propertyType: PositionType.Property;
  baseRent: number;
  currentRent: number;
}

export interface Railroad extends PropertyBase {
  propertyType: PositionType.Railroad;
}
export interface Utility extends PropertyBase {
  propertyType: PositionType.Utility;
}

export type GenericProperty = Property | Railroad | Utility;

export type PropertyQuote = PropertyBase & {
  offer: number;
  for: PlayerId;
};
