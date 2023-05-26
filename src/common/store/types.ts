import { ILoan, LoanId } from "common/loan/types";
import type { IPlayer } from "common/player/types";
import { GenericProperty, Property, Utility, Railroad } from "common/property/types";
import type { PlayerId } from "common/state/types";

export interface IPropertyStore {
  get(id: number): GenericProperty;
  updateProperty(id: number, property: Partial<Property>): void;
  updateUtility(id: number, property: Partial<Utility>): void;
  updateRailroad(id: number, property: Partial<Railroad>): void;
}
export interface ILoanStore {
  add(loan: ILoan): void;
  get(id: LoanId): ILoan;
}

export interface IPlayerStore {
  add(player: IPlayer): void;
  get(id: PlayerId): IPlayer;
}
