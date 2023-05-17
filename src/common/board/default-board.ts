import { BoardPosition, PositionType, PropertyColor } from "./types";

export const defaultBoard: BoardPosition<PositionType>[] = [
    {
        position: 0,
        type: PositionType.Blank,
        name: "Go",
    },
    {
        position: 1,
        type: PositionType.Property,
        color: PropertyColor.Brown,
        name: "Mediterranean Avenue",
        propertyId: 0,
        basePrice: 60
    },
    {
        position: 2,
        type: PositionType.CommunityChest,
        name: "Community Chest"
    },
    {
        position: 3,
        type: PositionType.Property,
        color: PropertyColor.Brown,
        name: "Baltic Avenue",
        propertyId: 1,
        basePrice: 60
    },
    {
        position: 4,
        type: PositionType.Tax,
        name: "Income Tax",
        baseAmount: 200
    },
    {
        position: 5,
        type: PositionType.Railroad,
        name: "Reading Railroad",
        propertyId: 2,
        basePrice: 200
    },
    {
        position: 6,
        type: PositionType.Property,
        color: PropertyColor.LightBlue,
        name: "Oriental Avenue",
        propertyId: 3,
        basePrice: 100
    },
    {
        position: 7,
        type: PositionType.Chance,
        name: "Chance"
    },
    {
        position: 8,
        type: PositionType.Property,
        color: PropertyColor.LightBlue,
        name: "Vermont Avenue",
        propertyId: 4,
        basePrice: 100
    },
    {
        position: 9,
        type: PositionType.Property,
        color: PropertyColor.LightBlue,
        name: "Conneticut Avenue",
        propertyId: 5,
        basePrice: 120
    },
    {
        position: 10,
        type: PositionType.Jail,
        name: "Jail",
    },
    {
        position: 11,
        type: PositionType.Property,
        color: PropertyColor.Fuschia,
        name: "St. Charles Place",
        propertyId: 6,
        basePrice: 140
    },
    {
        position: 12,
        type: PositionType.Utility,
        name: "Electric Company",
        propertyId: 7,
        basePrice: 150
    },
    {
        position: 13,
        type: PositionType.Property,
        color: PropertyColor.Fuschia,
        name: "States Avenue",
        propertyId: 8,
        basePrice: 140
    },
    {
        position: 14,
        type: PositionType.Property,
        color: PropertyColor.Fuschia,
        name: "Virginia Avenue",
        propertyId: 9,
        basePrice: 160
    },
    {
        position: 15,
        type: PositionType.Railroad,
        name: "Pennsylvania Railroad",
        propertyId: 10,
        basePrice: 200
    },
    {
        position: 16, 
        type: PositionType.Property,
        color: PropertyColor.Orange,
        name: "St. James Place",
        propertyId: 11,
        basePrice: 180
    },
    {
        position: 17,
        type: PositionType.CommunityChest,
        name: "Community Chest",
    },
    {
        position: 18,
        type: PositionType.Property,
        color: PropertyColor.Orange,
        name: "Tennessee Avenue",
        propertyId: 12,
        basePrice: 180
    },
    {
        position: 19,
        type: PositionType.Property,
        color: PropertyColor.Orange,
        name: "New York Avenue",
        propertyId: 13,
        basePrice: 200
    },
    {
        position: 20,
        type: PositionType.Blank,
        name: "Free Parking",
    },
    {
        position: 21,
        type: PositionType.Property,
        color: PropertyColor.Red,
        name: "Kentucky Avenue",
        propertyId: 14,
        basePrice: 220
    },
    {
        position: 22,
        type: PositionType.Chance,
        name: "Chance",
    },
    {
        position: 23,
        type: PositionType.Property,
        color: PropertyColor.Red,
        name: "Indiana Avenue",
        propertyId: 15,
        basePrice: 220
    },
    {
        position: 24,
        type: PositionType.Property,
        color: PropertyColor.Red,
        name: "Illinois Avenue",
        propertyId: 16,
        basePrice: 240
    },
    {
        position: 25, 
        type: PositionType.Railroad,
        name: "B & O Railroad",
        propertyId: 17,
        basePrice: 200
    },
    {
        position: 26,
        type: PositionType.Property,
        color: PropertyColor.Yellow,
        name: "Atlantic Avenue",
        propertyId: 18,
        basePrice: 260
    },
    {
        position: 27,
        type: PositionType.Property,
        color: PropertyColor.Yellow,
        name: "Ventnor Avenue",
        propertyId: 19,
        basePrice: 260
    },
    {
        position: 28,
        type: PositionType.Utility,
        name: "Waterworks",
        propertyId: 20,
        basePrice: 150
    },
    {
        position: 29,
        type: PositionType.Property,
        color: PropertyColor.Yellow,
        name: "Marvin Gardens",
        propertyId: 21,
        basePrice: 280
    },
    {
        position: 30,
        type: PositionType.GoToJail,
        name: "Go to Jail",
        jailPosition: 10
    },
    {
        position: 31,
        type: PositionType.Property,
        color: PropertyColor.Green,
        name: "Pacific Avenue",
        propertyId: 22,
        basePrice: 300
    },
    {
        position: 32,
        type: PositionType.Property,
        color: PropertyColor.Green,
        name: "North Carolina Avenue",
        propertyId: 23,
        basePrice: 300
    },
    {
        position: 33,
        type: PositionType.CommunityChest,
        name: "Community Chest"
    },
    {
        position: 34,
        type: PositionType.Property,
        color: PropertyColor.Green,
        name: "Pennsylvania Avenue",
        propertyId: 24,
        basePrice: 320
    },
    {
        position: 35,
        type: PositionType.Railroad,
        name: "Short Line",
        propertyId: 25,
        basePrice: 200
    },
    {
        position: 36,
        type: PositionType.Chance,
        name: "Chance",
    },
    {
        position: 37,
        type: PositionType.Property,
        color: PropertyColor.Blue,
        name: "Park Place",
        propertyId: 26,
        basePrice: 350
    },
    {
        position: 38,
        type: PositionType.Tax,
        name: "Luxury Tax",
        baseAmount: 100
    },
    {
        position: 39,
        type: PositionType.Property,
        color: PropertyColor.Blue,
        name: "Boardwalk",
        propertyId: 27,
        basePrice: 400
    }
]