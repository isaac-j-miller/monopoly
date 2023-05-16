export enum PropertyColor {
    Brown,
    LightBlue,
    Fuschia,
    Orange,
    Red,
    Yellow,
    Green, 
    Blue
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

export type PropertyTypeBase = {
    propertyId: number;
    basePrice: number;
}

type PositionTypeMap = {
    [PositionType.Property]: PropertyTypeBase & {
        color: PropertyColor
    }
    [PositionType.Railroad]: PropertyTypeBase
    [PositionType.Utility]: PropertyTypeBase
    [PositionType.Chance]: {}
    [PositionType.Blank]: {}
    [PositionType.Jail]: {}
    [PositionType.CommunityChest]: {}
    [PositionType.Tax]: {
        baseAmount: number;
    }
    [PositionType.GoToJail]: {
        jailPosition: number;
    }
}