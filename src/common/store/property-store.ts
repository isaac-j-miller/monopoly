import { BoardPosition, IBoard, PositionType } from "common/board/types";
import { IPropertyStore } from "./types";
import { GenericProperty, Property, Utility, Railroad, PropertyLevel } from "common/property/types";
import { assertNever } from "common/util";

export class PropertyStore implements IPropertyStore {
    private genericProperties: Record<number, GenericProperty>
    constructor(private board: IBoard) {
        this.genericProperties = {};
        board.positions.forEach(pos => {
            if(pos.type === PositionType.Property||pos.type===PositionType.Railroad||pos.type===PositionType.Utility) {
                switch(pos.type) {
                    case PositionType.Property: {
                        const p = pos as BoardPosition<typeof pos.type>;
                        const {type, ...rest} = p
                        const property: Property = {
                            ...rest,
                            owner: "Bank_0",
                            level: PropertyLevel.Unimproved,
                            propertyType: PositionType.Property,
                            marketValue: rest.basePrice,
                            realValue: rest.basePrice,
                            currentRent: rest.baseRent
                        } 
                        this.genericProperties[p.propertyId] = property
                        return;
                    }
                    case PositionType.Railroad:{
                        const p = pos as BoardPosition<typeof pos.type>;
                        const {type, ...rest} = p
                        const property: Railroad = {
                            ...rest,
                            owner: "Bank_0",
                            propertyType: PositionType.Railroad,
                            marketValue: rest.basePrice,
                            realValue: rest.basePrice
                        } 
                        this.genericProperties[p.propertyId] = property
                        return;
                    }
                    case PositionType.Utility: {
                        const p = pos as BoardPosition<typeof pos.type>;
                        const {type, ...rest} = p
                        const property: Utility = {
                            ...rest,
                            owner: "Bank_0",
                            propertyType: PositionType.Utility,
                            marketValue: rest.basePrice,
                            realValue: rest.basePrice
                        } 
                        this.genericProperties[p.propertyId] = property
                        return;
                    }
                    default:
                        assertNever(pos.type)
                }
            }
        })
    }
    get(id: number): GenericProperty {
        return this.genericProperties[id];
    }
    updateProperty(id: number, property: Partial<Property>): void {
        const p=this.get(id);
        if(p.propertyType!==PositionType.Property) {
            throw new Error(`PropertyID ${id} is not a property but instead a ${PositionType[p.propertyType]}`)
        }
        this.genericProperties[id] = {
            ...p,
            ...property
        }
    }
    updateUtility(id: number, property: Partial<Utility>): void {
        const p=this.get(id);
        if(p.propertyType!==PositionType.Utility) {
            throw new Error(`PropertyID ${id} is not a utility but instead a ${PositionType[p.propertyType]}`)
        }
        this.genericProperties[id] = {
            ...p,
            ...property
        }
    }
    updateRailroad(id: number, property: Partial<Railroad>): void {
        const p=this.get(id);
        if(p.propertyType!==PositionType.Railroad) {
            throw new Error(`PropertyID ${id} is not a railroad but instead a ${PositionType[p.propertyType]}`)
        }
        this.genericProperties[id] = {
            ...p,
            ...property
        }
    }
}