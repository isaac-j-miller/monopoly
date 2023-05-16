export enum PropertyLevel {
    Unimproved,
    OneHouse,
    TwoHouses,
    ThreeHouses,
    FourHouses,
    Hotel,
    Skyscraper
}

export enum InterestRateType {
    Fixed,
    Variable
}

export interface Property {
    basePrice: number;
    baseRent: number;
    level: PropertyLevel;
    position: number;
    marketValue: number;
    currentRent: number;
}

export enum CreditRating {
    D,
    C,
    CC,
    CCC,
    B,
    BB,
    BBB,
    A,
    AA,
    AAA
}

export type PlayerType = "Player" | "Bank";

export type PlayerId = `${PlayerType}_${number}`;

export interface Loan {
    creditor: PlayerId;
    debtor: PlayerId;
    rateType: InterestRateType;
    currentRate: number;
    remainingBalance: number;
    remainingPrincipal: number;
    remainingInterest: number;
    initialPrincipal: number;
    remainingPayments: number;
    paymentAmount: number;
    term: number;
}

export interface PlayerState {
    position: number;
    inJail: boolean;
    inJailSince: number | null;
    cashOnHand: number;
    loans: Loan[];
    properties: Property[];
    netWorth: number;
    creditRating: CreditRating;
}