import React from "react";
import { PropertyQuote } from "common/property/types";
import { GameState } from "common/state/types";
import { VerticalDiv } from "../../common/flex";
import { PositionType } from "common/board/types";

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
        Offer Price: {quote.offer.toLocaleString("en-US", { currency: "usd" })} &lpar;Base Price:{" "}
        {quote.basePrice.toLocaleString("en-US", { currency: "usd" })}&rpar;
      </p>
      <p>Current Owner: {quote.owner}</p>
    </VerticalDiv>
  );
};
