import { PayBankReason } from "common/events/types";

export enum PropertyColor {
  Brown,
  LightBlue,
  Fuschia,
  Orange,
  Red,
  Yellow,
  Green,
  Blue,
}

export enum PositionType {
  Property,
  Utility,
  Railroad,
  Chance,
  Blank,
  Jail,
  CommunityChest,
  Tax,
  GoToJail,
}
export type BoardPosition<T extends PositionType> = {
  position: number;
  name: string;
  type: T;
} & PositionTypeMap[T];

export interface IBoard {
  getAllPropertiesOfColor(color: PropertyColor): BoardPosition<PositionType.Property>[];
  getAllPositionsOfType<T extends PositionType>(type: T): BoardPosition<T>[];
  positions: BoardPosition<PositionType>[];
}

export type PropertyTypeBase = {
  propertyId: number;
  basePrice: number;
};

type PositionTypeMap = {
  [PositionType.Property]: PropertyTypeBase & {
    color: PropertyColor;
    baseRent: number;
  };
  [PositionType.Railroad]: PropertyTypeBase;
  [PositionType.Utility]: PropertyTypeBase & {
    icon: string;
  };
  [PositionType.Chance]: {};
  [PositionType.Blank]: {};
  [PositionType.Jail]: {};
  [PositionType.CommunityChest]: {};
  [PositionType.Tax]: {
    taxType: PayBankReason.IncomeTax | PayBankReason.LuxuryTax;
    baseAmount: number;
    icon: string;
  };
  [PositionType.GoToJail]: {
    jailPosition: number;
  };
};
