import React from "react";
import { Button } from "@blueprintjs/core";
import { GameState, PlayerId } from "common/state/types";
import { LoanQuote } from "common/loan/types";
import { HorizontalDiv, VerticalDiv } from "../../common/flex";

type QuoteProps = {
  state: GameState;
  playerId: PlayerId;
  requestor: PlayerId;
  propertyId: number;
  onSubmit: (loanQuote: LoanQuote | null) => void;
};

export const WritePropertyQuoteForm: React.FC<QuoteProps> = ({ playerId, requestor, onSubmit }) => {
  // TODO: implement

  // const defaultQuote: PropertyQuote = {

  // }
  // const [quote, setQuote] = React.useState<PropertyQuote>(defaultQuote)
  return (
    <VerticalDiv>
      <HorizontalDiv>
        <Button onClick={() => onSubmit(null)} intent="danger">
          Reject Request
        </Button>
      </HorizontalDiv>
    </VerticalDiv>
  );
};
