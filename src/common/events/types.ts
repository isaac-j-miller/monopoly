import type { PositionType } from "common/board/types";
import type { ILoan, LoanId } from "common/loan/types";
import type { PropertyLevel } from "common/property/types";
import type { PlayerId } from "common/state/types";

export enum EventType {
  RentPayment,
  LoanPayment,
  LoanCreation,
  LoanTransfer,
  PlayerMove,
  LoanChangeInterestRate,
  PropertyTransfer,
  PropertyUpgrade,
  PropertyDowngrade,
  PlayerDeclareBankruptcy,
  CompleteTurn,
  CompletePlayerTurn,
  PayBank,
  DrawChanceCard,
  DrawCommunityChestCard,
  GoToJail,
  GetOutOfJail,
  PlayerPayOffLoan,
  UseChanceCard,
  UseCommunityChestCard,
  LoanAccrueInterest,
  Roll,
  BankPayPlayer,
}

export enum PayBankReason {
  LuxuryTax,
  IncomeTax,
  PayToGetOutOfJail,
  PropertyUpgrade,
  // TODO: more reasons
}

export enum GetOutOfJailReason {
  Duration,
  Pay,
  Doubles,
  Card,
}

export interface Event<TEventType> {
  type: TEventType;
  turn: number;
  order: number;
}

export interface Payment {
  amount: number;
}

export interface TransferEvent extends Payment {
  from: PlayerId;
  to: PlayerId;
}
export interface PropertyEvent {
  propertyId: number;
  propertyType: PositionType.Property | PositionType.Railroad | PositionType.Utility;
}
export interface PlayerEvent {
  player: PlayerId;
}
export interface RentPaymentEvent
  extends Event<EventType.RentPayment>,
    PropertyEvent,
    PlayerEvent {}
interface LoanEvent {
  loanId: LoanId;
}
export interface LoanPaymentEvent extends Event<EventType.LoanPayment>, Payment, LoanEvent {}
export interface LoanCreationEvent extends Event<EventType.LoanCreation> {
  loan: ILoan;
}
export interface LoanTransferEvent extends Event<EventType.LoanTransfer>, Payment, LoanEvent {
  originalCreditor: PlayerId;
  newCreditor: PlayerId;
}
export interface PlayerMoveEvent extends Event<EventType.PlayerMove>, PlayerEvent {
  delta: number;
}
export interface LoanChangeInterestRateEvent
  extends Event<EventType.LoanChangeInterestRate>,
    LoanEvent {
  newInterestRate: number;
}
export interface PropertyTransferEvent
  extends Event<EventType.PropertyTransfer>,
    TransferEvent,
    PropertyEvent {}
export interface PropertyUpgradeEvent
  extends Event<EventType.PropertyUpgrade>,
    Omit<PropertyEvent, "propertyType"> {
  newLevel: PropertyLevel;
}
export interface PropertyDowngradeEvent
  extends Event<EventType.PropertyDowngrade>,
    Omit<PropertyEvent, "propertyType"> {
  newLevel: PropertyLevel;
}
export interface PlayerDeclareBankruptcyEvent
  extends Event<EventType.PlayerDeclareBankruptcy>,
    PlayerEvent {}

export interface CompletePlayerTurnEvent extends Event<EventType.CompletePlayerTurn>, PlayerEvent {}

export interface CompleteTurnEvent extends Event<EventType.CompleteTurn> {}

export interface PayBankEvent extends Event<EventType.PayBank>, PlayerEvent, Payment {
  reason: PayBankReason;
}

export interface DrawChanceCardEvent extends Event<EventType.DrawChanceCard>, PlayerEvent {
  // TODO: do something with this
}

export interface DrawCommunityChestCardEvent
  extends Event<EventType.DrawCommunityChestCard>,
    PlayerEvent {
  // TODO: do something with this
}

export interface GoToJailEvent extends Event<EventType.GoToJail>, PlayerEvent {}

export interface GetOutOfJailEvent extends Event<EventType.GetOutOfJail>, PlayerEvent {
  reason: GetOutOfJailReason;
}

export interface PlayerPayOffLoanEvent
  extends Event<EventType.PlayerPayOffLoan>,
    PlayerEvent,
    LoanEvent {}

export interface UseChanceCardEvent extends Event<EventType.UseChanceCard>, PlayerEvent {}

export interface UseCommunityChestCardEvent
  extends Event<EventType.UseCommunityChestCard>,
    PlayerEvent {}

export interface LoanAccrueInterestEvent extends Event<EventType.LoanAccrueInterest>, LoanEvent {}

export interface BankPayPlayerEvent extends Event<EventType.BankPayPlayer>, PlayerEvent, Payment {}

export interface RollEvent extends Event<EventType.Roll>, PlayerEvent {
  roll: [number, number];
}

export type EventTypeMap = {
  [EventType.LoanCreation]: LoanCreationEvent;
  [EventType.LoanPayment]: LoanPaymentEvent;
  [EventType.LoanChangeInterestRate]: LoanChangeInterestRateEvent;
  [EventType.LoanTransfer]: LoanTransferEvent;
  [EventType.PlayerDeclareBankruptcy]: PlayerDeclareBankruptcyEvent;
  [EventType.PlayerMove]: PlayerMoveEvent;
  [EventType.PropertyTransfer]: PropertyTransferEvent;
  [EventType.PropertyUpgrade]: PropertyUpgradeEvent;
  [EventType.PropertyDowngrade]: PropertyDowngradeEvent;
  [EventType.RentPayment]: RentPaymentEvent;
  [EventType.CompletePlayerTurn]: CompletePlayerTurnEvent;
  [EventType.CompleteTurn]: CompleteTurnEvent;
  [EventType.DrawChanceCard]: DrawChanceCardEvent;
  [EventType.DrawCommunityChestCard]: DrawCommunityChestCardEvent;
  [EventType.GetOutOfJail]: GetOutOfJailEvent;
  [EventType.GoToJail]: GoToJailEvent;
  [EventType.PlayerPayOffLoan]: PlayerPayOffLoanEvent;
  [EventType.UseChanceCard]: UseChanceCardEvent;
  [EventType.UseCommunityChestCard]: UseCommunityChestCardEvent;
  [EventType.PayBank]: PayBankEvent;
  [EventType.LoanAccrueInterest]: LoanAccrueInterestEvent;
  [EventType.Roll]: RollEvent;
  [EventType.BankPayPlayer]: BankPayPlayerEvent;
};

export type GameEvent = EventTypeMap[EventType];
