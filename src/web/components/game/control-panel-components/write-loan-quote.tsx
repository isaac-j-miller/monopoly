import React from "react";
import { GameState, InterestRateType, PlayerId } from "common/state/types";
import { LoanQuote } from "common/loan/types";
import { getNominalPaymentAmount } from "common/loan";
import { HorizontalDiv, VerticalDiv } from "../../common/flex";
import { Button, FormGroup, NumericInput } from "@blueprintjs/core";

type QuoteProps = {
  playerId: PlayerId;
  requestor: PlayerId;
  requestedAmount: number;
  onSubmit: (loanQuote: LoanQuote | null) => void;
};

export const WriteLoanQuoteForm: React.FC<QuoteProps> = ({
  playerId,
  requestor,
  requestedAmount,
  onSubmit,
}) => {
  const defaultQuote: LoanQuote = {
    amount: requestedAmount,
    debtor: requestor,
    creditor: playerId,
    rate: 0.05,
    rateType: InterestRateType.Fixed,
    term: 20,
  };
  const [quote, setQuote] = React.useState<LoanQuote>(defaultQuote);
  return (
    <VerticalDiv>
      <h4 className="pb4-heading">Would you offer a loan to {quote.debtor}?</h4>
      <p>Creditor: {quote.creditor}</p>
      <FormGroup label="Interest Rate (%)" labelInfo="(required)">
        <NumericInput
          value={quote.rate * 100}
          max={100}
          min={0}
          stepSize={1}
          majorStepSize={5}
          minorStepSize={0.25}
          onValueChange={v =>
            setQuote({
              ...quote,
              rate: v / 100,
            })
          }
        />
      </FormGroup>
      <FormGroup label="Loan Term (Turns)" labelInfo="(required)">
        <NumericInput
          value={quote.term}
          max={100}
          min={5}
          stepSize={5}
          majorStepSize={10}
          minorStepSize={1}
          onValueChange={v =>
            setQuote({
              ...quote,
              term: v,
            })
          }
        />
      </FormGroup>
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
      <HorizontalDiv>
        <Button onClick={() => onSubmit(null)} intent="danger">
          Reject Request
        </Button>
        <Button onClick={() => onSubmit(quote)} intent="success">
          Offer Loan
        </Button>
      </HorizontalDiv>
    </VerticalDiv>
  );
};
