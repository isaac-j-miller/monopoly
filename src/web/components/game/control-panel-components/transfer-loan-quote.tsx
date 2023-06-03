import React from "react";
import { CreditRating, GameState, InterestRateType } from "common/state/types";
import { TransferLoanQuote } from "common/loan/types";
import { getNominalPaymentAmount } from "common/loan";
import { currencyFormatter } from "common/formatters/number";
import { VerticalDiv } from "../../common/flex";

type QuoteProps = {
  state: GameState;
  quote: TransferLoanQuote;
};

export const TransferLoanQuoteDisplay: React.FC<QuoteProps> = ({ state, quote }) => {
  const creditRating = state.playerStore.get(quote.debtor).creditRating;
  return (
    <VerticalDiv>
      <h4 className="pb4-heading">Offer to purchase loan from {quote.creditor}</h4>
      <p>Original Creditor: {quote.creditor}</p>
      <p>
        Debtor: {quote.debtor} &lpar;Credit Rating: {CreditRating[creditRating]}&rpar;
      </p>
      <p>
        Remaining Amount: {currencyFormatter(quote.amount)} at {(quote.rate * 100).toPrecision(2)}
        %/turn for {quote.term} turns
      </p>
      <p>
        Expected payment per turn:{" "}
        {currencyFormatter(getNominalPaymentAmount(quote.amount, quote.term, quote.rate))}
      </p>
      <p>Remaining turns: {}</p>
      <p>Rate Type: {InterestRateType[quote.rateType]}</p>
    </VerticalDiv>
  );
};
