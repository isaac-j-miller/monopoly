import React from "react";
import { PropertyQuote } from "common/property/types";
import { GameState } from "common/state/types";
import { PositionType } from "common/board/types";
import { currencyFormatter } from "common/formatters/number";
import { VerticalDiv } from "../../common/flex";

type QuoteProps = {
  state: GameState;
  quote: PropertyQuote;
};

export const PropertyQuoteDisplay: React.FC<QuoteProps> = ({ state, quote }) => {
  return (
    <VerticalDiv>
      <h4 className="pb4-heading">Property Offer for {quote.for}</h4>
      <p>
        Property: {quote.name} &lpar;{PositionType[quote.propertyType]}&rpar;
      </p>
      <p>
        Offer Price: {currencyFormatter(quote.offer)} &lpar;Base Price:{" "}
        {currencyFormatter(quote.basePrice)}&rpar;
      </p>
      <p>Current Owner: {quote.owner}</p>
    </VerticalDiv>
  );
};
