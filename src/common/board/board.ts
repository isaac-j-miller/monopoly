import { BoardPosition, IBoard, PositionType, PropertyColor } from "./types";

export class Board implements IBoard {
    private colorMap: Record<PropertyColor,Set<number>>
    private typeMap: Record<PositionType, Set<number>>
    constructor(public readonly positions: BoardPosition<PositionType>[]) {
        this.colorMap = {
            [PropertyColor.Blue]: new Set<number>(),   
            [PropertyColor.Brown]: new Set<number>(),
            [PropertyColor.Fuschia]: new Set<number>(),
            [PropertyColor.Green]: new Set<number>(),
            [PropertyColor.LightBlue]: new Set<number>(),
            [PropertyColor.Orange]: new Set<number>(),
            [PropertyColor.Red]: new Set<number>(),
            [PropertyColor.Yellow]: new Set<number>(),
        }
        this.typeMap = {
            [PositionType.Blank]: new Set<number>(),
            [PositionType.Chance]: new Set<number>(),
            [PositionType.CommunityChest]: new Set<number>(),
            [PositionType.GoToJail]: new Set<number>(),
            [PositionType.Jail]: new Set<number>(),
            [PositionType.Property]: new Set<number>(),
            [PositionType.Railroad]: new Set<number>(),
            [PositionType.Utility]: new Set<number>(),
            [PositionType.Tax]: new Set<number>(),
        }
        positions.forEach(pos=>{
            if(pos.type === PositionType.Property) {
                const asProperty = pos as BoardPosition<PositionType.Property>;
                this.colorMap[asProperty.color].add(pos.position)
            }
            this.typeMap[pos.type].add(pos.position)
        })
    }
    getAllPropertiesOfColor(color: PropertyColor): BoardPosition<PositionType.Property>[] {
        const positions = this.colorMap[color];
        return Array.from(positions).map(pos => this.positions[pos] as BoardPosition<PositionType.Property>)
    }
    getAllPositionsOfType<T extends PositionType>(type: T): BoardPosition<T>[] {
        const positions = this.typeMap[type];
        return Array.from(positions).map(pos => this.positions[pos] as BoardPosition<T>)
    }
}