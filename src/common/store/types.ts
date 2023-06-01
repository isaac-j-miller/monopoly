import { ILoan, LoanId } from "common/loan/types";
import type { IPlayer } from "common/player/types";
import { GenericProperty, Property, Utility, Railroad } from "common/property/types";
import type { PlayerId } from "common/state/types";

export interface IPropertyStore {
  all(): GenericProperty[];
  get(id: number): GenericProperty;
  updateProperty(id: number, property: Partial<Property>): void;
  updateUtility(id: number, property: Partial<Utility>): void;
  updateRailroad(id: number, property: Partial<Railroad>): void;
  withProperty<T>(id: number, fn: (property: GenericProperty) => T): T;
}
export interface ILoanStore {
  all(): ILoan[];
  set(loan: ILoan): void;
  get(id: LoanId): ILoan;
  withLoan<T>(id: LoanId, fn: (loan: ILoan) => T): T;
}

export interface IPlayerStore {
  set(player: IPlayer): void;
  get(id: PlayerId): IPlayer;
  withPlayer<T>(id: PlayerId, fn: (player: IPlayer) => T): T;
}
