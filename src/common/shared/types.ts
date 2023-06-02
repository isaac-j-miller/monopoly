import { PlayerId } from "common/state/types";
import { LoanQuote, TransferLoanQuote } from "common/loan/types";
import { PropertyQuote } from "common/property/types";

export type CreateGameResponse = {
  gameId: string;
  observer: SerializedGamePlayer;
  keys: Record<PlayerId, SerializedGamePlayer>;
};

export type OptionalGamePlayer = {
  gameId: string;
  playerId: PlayerId | null;
};

export type GamePlayer = {
  gameId: string;
  playerId: PlayerId;
};

export type SerializedGamePlayer = `${string}.${string | ""}`;

export enum DecisionMakerTask {
  None,
  OptionalActions,
  DecideToAcceptTransferLoanQuote,
  CoverCashShortfall,
  DecideHowToFinancePayment,
  DecideToUseGetOutOfJailFreeCard,
  DecideToPayToGetOutOfJail,
  DecideToAcceptPropertyQuote,
  WriteLoanQuoteForPlayer,
  WritePropertyQuoteForPlayer,
  DecideToBuyCurrentPropertyFromBank,
}
export type DecisionMakerTaskEvent<T extends DecisionMakerTask> = {
  taskType: T;
  event: DecisionMakerTaskEventType[T];
  id: string;
};

export type DecisionMakerTaskEventType = {
  [DecisionMakerTask.None]: null;
  [DecisionMakerTask.OptionalActions]: null;
  [DecisionMakerTask.DecideToAcceptTransferLoanQuote]: TransferLoanQuote;
  [DecisionMakerTask.CoverCashShortfall]: null;
  [DecisionMakerTask.DecideHowToFinancePayment]: number;
  [DecisionMakerTask.DecideToUseGetOutOfJailFreeCard]: null;
  [DecisionMakerTask.DecideToPayToGetOutOfJail]: null;
  [DecisionMakerTask.DecideToAcceptPropertyQuote]: PropertyQuote;
  [DecisionMakerTask.WriteLoanQuoteForPlayer]: {
    playerId: PlayerId;
    amount: number;
  };
  [DecisionMakerTask.WritePropertyQuoteForPlayer]: {
    playerId: PlayerId;
    propertyId: number;
  };
  [DecisionMakerTask.DecideToBuyCurrentPropertyFromBank]: null;
};

export type DecisionMakerTaskEventResponseType = {
  [DecisionMakerTask.None]: null;
  [DecisionMakerTask.OptionalActions]: null;
  [DecisionMakerTask.DecideToAcceptTransferLoanQuote]: boolean;
  [DecisionMakerTask.CoverCashShortfall]: null;
  [DecisionMakerTask.DecideHowToFinancePayment]: LoanQuote | null;
  [DecisionMakerTask.DecideToUseGetOutOfJailFreeCard]: boolean;
  [DecisionMakerTask.DecideToPayToGetOutOfJail]: boolean;
  [DecisionMakerTask.DecideToAcceptPropertyQuote]: boolean;
  [DecisionMakerTask.WriteLoanQuoteForPlayer]: LoanQuote | null;
  [DecisionMakerTask.WritePropertyQuoteForPlayer]: PropertyQuote | null;
  [DecisionMakerTask.DecideToBuyCurrentPropertyFromBank]: boolean;
};
