import { IGame } from "common/game/types";
import type { LoanId, LoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";
import type { CreditRating, PlayerId } from "common/state/types";

export interface IPlayer {
    readonly id: PlayerId;
    readonly isBank: boolean;
    readonly creditRating: CreditRating;
    readonly inJail: boolean;
    readonly inJailSince: number|null;
    readonly position: number;
    readonly mostRecentRoll: [number, number] | null;
    readonly creditRatingLendingThreshold: CreditRating;
    readonly cashOnHand: number;
    setMostRecentRoll(roll: [number, number]): void
    setPosition(position: number): void
    getOutOfJail(): void;
    goToJail(turn: number): void;
    getTotalAssetValue(): number;
    getTotalLiabilityValue(): number;
    recalculateValues(): void;
    addCash(amount: number): void;
    subtractCash(amount: number): void;
    addCreditLoan(id: LoanId): void;
    removeCreditLoan(id: LoanId): void;
    addDebtLoan(id: LoanId): void;
    removeDebtLoan(id: LoanId): void;
    addProperty(id: number): void;
    removeProperty(id: number): void;
    takeTurn: () => Promise<void>;
    purchaseProperty(quote: PropertyQuote): void;
    sellProperty(quote: PropertyQuote): void;
    takeOutLoan(quote: LoanQuote): void;
    makeLoanToOtherPlayer(quote: LoanQuote): void;
    register(game: IGame): void;
    getPurchasePropertyQuoteForPlayer(player: PlayerId, propertyId: number): Promise<PropertyQuote|null>
    getLoanQuoteForPlayer(player: PlayerId, amount: number): Promise<LoanQuote|null>
    getLoanQuotesFromOtherPlayers(amount: number): Promise<LoanQuote[]>
    getSellPropertyQuotesFromOtherPlayers(propertyId: number, price: number): Promise<PropertyQuote[]>
    decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean>
}