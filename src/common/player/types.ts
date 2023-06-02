import { HumanOrComputerPlayerType } from "common/config/types";
import { PayBankReason } from "common/events/types";
import { IGame } from "common/game/types";
import type { LoanId, LoanQuote, TransferLoanQuote } from "common/loan/types";
import { PropertyLevel, PropertyQuote } from "common/property/types";
import type { CreditRating, PlayerId, SerializablePlayerState } from "common/state/types";

export interface IPlayer {
  readonly id: PlayerId;
  readonly type: HumanOrComputerPlayerType;
  readonly emoji: string;
  readonly isBank: boolean;
  readonly creditRating: CreditRating;
  readonly inJail: boolean;
  readonly inJailSince: number | null;
  readonly position: number;
  readonly mostRecentRoll: [number, number] | null;
  readonly creditRatingLendingThreshold: CreditRating;
  readonly cashOnHand: number;
  readonly properties: Set<number>;
  readonly creditLoans: Set<LoanId>;
  readonly debtLoans: Set<LoanId>;
  readonly getOutOfJailFreeCards: number;
  readonly isBankrupt: boolean;
  getState(): SerializablePlayerState;
  setMostRecentRoll(roll: [number, number]): void;
  setPosition(position: number): void;
  getOutOfJail(): void;
  goToJail(turn: number): void;
  getNetWorth(): number;
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
  getPurchasePropertyQuoteForPlayer(
    player: PlayerId,
    propertyId: number
  ): Promise<PropertyQuote | null>;
  getLoanQuoteForPlayer(player: PlayerId, amount: number, depth: number): Promise<LoanQuote | null>;
  getLoanQuotesFromOtherPlayers(
    amount: number,
    depth: number,
    excludePlayers?: PlayerId[]
  ): Promise<LoanQuote[]>;
  getSellPropertyQuotesFromOtherPlayers(
    propertyId: number,
    price: number
  ): Promise<PropertyQuote[]>;
  decideToAcceptPropertyQuote(quote: PropertyQuote): Promise<boolean>;
  decideToPayToGetOutOfJail(): Promise<boolean>;
  decideToUseGetOutOfJailFreeCard(): Promise<boolean>;
  payCashToBank(amount: number, reason: PayBankReason): void;
  handleFinanceOption(amount: number, reason: string): Promise<void>;
  decideToAcceptTransferLoanQuote(quote: TransferLoanQuote): Promise<boolean>;
  getTransferLoanOffersFromOtherPlayers(
    loanId: LoanId,
    price: number
  ): Promise<TransferLoanQuote[]>;
  sellLoan(quote: TransferLoanQuote): void;
  upgradeProperty(propertyId: number, newLevel: PropertyLevel): void;
  sellPropertyUpgrades(propertyId: number, newLevel: PropertyLevel): void;
  declareBankruptcy(): void;
}
