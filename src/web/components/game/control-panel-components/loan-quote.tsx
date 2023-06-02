import React from "react";
import { GameState, InterestRateType } from "common/state/types";
import { LoanQuote } from "common/loan/types";
import { getNominalPaymentAmount } from "common/loan";
import { VerticalDiv } from "../../common/flex";

type QuoteProps = {
  state: GameState;
  quote: LoanQuote;
};

export const LoanQuoteDisplay: React.FC<QuoteProps> = ({ state, quote }) => {
  return (
    <VerticalDiv>
      <h4 className="pb4-heading">Loan Offer for {quote.debtor}</h4>
      <p>Creditor: {quote.creditor}</p>
      <p>
        Amount: {quote.amount.toLocaleString("en-US", { currency: "usd" })} at{" "}
        {(quote.rate * 100).toPrecision(2)}%/turn for {quote.term} turns
      </p>
      <p>
        Due each turn:{" "}
        {getNominalPaymentAmount(quote.amount, quote.term, quote.rate).toLocaleString("en-US", {
          currency: "usd",
        })}
      </p>
      <p>Rate Type: {InterestRateType[quote.rateType]}</p>
    </VerticalDiv>
  );
};
