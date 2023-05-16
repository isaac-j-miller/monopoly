import { Loan, PlayerId, PropertyLevel } from "common/state/types"

export enum EventType {
    RentPayment,
    LoanPayment,
    LoanCreation,
    LoanTransfer,
    PlayerMove,
    LoanRaiseInterestRate,
    PropertyTransfer,
    PropertyUpgrade,
    PlayerDeclareBankruptcy
}

export interface Event<TEventType> {
    type: TEventType
    turn: number;
    order: number;
}

export interface Payment {
    amount: number;
}

export interface TransferEvent extends Payment {
    from: PlayerId,
    to: PlayerId,
}
export interface PropertyEvent {
    propertyId: number;
}
export interface PlayerEvent {
    player: PlayerId
}
export interface RentPaymentEvent extends Event<EventType.RentPayment>, Payment, PropertyEvent {
}
interface LoanEvent {
    loanId: number;
}
export interface LoanPaymentEvent extends Event<EventType.LoanPayment>, Payment, LoanEvent {}
export interface LoanCreationEvent extends Event<EventType.LoanCreation>, LoanEvent, Loan {}
export interface LoanTransferEvent extends Event<EventType.LoanTransfer>, LoanEvent {
    originalCreditor: PlayerId;
    newCreditor: PlayerId;
}
export interface PlayerMoveEvent extends Event<EventType.PlayerMove>, PlayerEvent {
    delta: number;
}
export interface LoanRaiseInterestRateEvent extends Event<EventType.LoanRaiseInterestRate>, LoanEvent {
    increaseAmount: number;
}
export interface PropertyTransferEvent extends Event<EventType.PropertyTransfer>, TransferEvent, PropertyEvent {

}
export interface PropertyUpgradeEvent extends Event<EventType.PropertyUpgrade>, PropertyEvent {
    newLevel: PropertyLevel
}
export interface PlayerDeclareBankruptcyEvent extends Event<EventType.PlayerDeclareBankruptcy> {

}

export type EventTypeMap = {
    [EventType.LoanCreation]: LoanCreationEvent;
    [EventType.LoanPayment]: LoanPaymentEvent;
    [EventType.LoanRaiseInterestRate]: LoanRaiseInterestRateEvent;
    [EventType.LoanTransfer]: LoanTransferEvent;
    [EventType.PlayerDeclareBankruptcy]: PlayerDeclareBankruptcyEvent;
    [EventType.PlayerMove]: PlayerMoveEvent;
    [EventType.PropertyTransfer]: PropertyTransferEvent;
    [EventType.PropertyUpgrade]: PropertyUpgradeEvent;
    [EventType.RentPayment]: RentPaymentEvent;
}
export type GameEvent = EventTypeMap[EventType];