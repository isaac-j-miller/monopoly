import React from "react";
import styled from "@emotion/styled";
import { Card } from "@blueprintjs/core";
import { Property } from "common/property/types";
import { currencyFormatter } from "common/formatters/number";
import { GameState, PlayerId } from "common/state/types";
import { getPropertyDiscountedCashFlow, getUpgradeCost } from "common/property/upgrades";
import { calculateExpectedReturnOnPropertyPerTurn } from "common/events/util";
import { ColorBar, ImprovementEmojiTooltip, colorMap } from "../board-components/property";

type PropertyCardProps = {
  state: GameState;
  property: Property;
  nameGenerator: (player: PlayerId) => string;
};

const CardBox = styled(Card)`
  width: 18em;
  height: 26em;
  display: block;
`;

const RestOfCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 80%;
  div {
    align-items: center;
    display: flex;
    justify-content: space-around;
    text-align: center;
    vertical-align: middle;
  }
`;

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, state, nameGenerator }) => {
  const color = colorMap[property.color];
  const discountedCashFlow = getPropertyDiscountedCashFlow(property, state);
  const projectedIncomePerTurn = calculateExpectedReturnOnPropertyPerTurn(
    state,
    property.propertyId,
    property.owner
  );
  return (
    <CardBox elevation={1}>
      <ColorBar style={{ backgroundColor: color }}>
        <ImprovementEmojiTooltip level={property.level} />
      </ColorBar>
      <RestOfCard>
        <h4 className="bp4-heading">{property.name}</h4>
        <div>
          <b>Current Rent:</b>&nbsp;{currencyFormatter(property.currentRent)}
        </div>
        <div>
          <b>Base Price:</b>&nbsp;{currencyFormatter(property.basePrice)}
        </div>
        <div>
          <b>Market Value:</b>&nbsp;{currencyFormatter(property.marketValue)}
        </div>
        <div>
          <b>Upgrade Cost:</b>&nbsp;
          {currencyFormatter(getUpgradeCost(property, property.level + 1))}
        </div>
        <div>
          <b>Owner:</b>&nbsp;{nameGenerator(property.owner)}
        </div>
        <div>
          <b>Discounted Cash Flow:</b>&nbsp;{currencyFormatter(discountedCashFlow, true)}
        </div>
        <div>
          <b>Projected Income Per Turn:</b>&nbsp;{currencyFormatter(projectedIncomePerTurn, true)}
        </div>
      </RestOfCard>
    </CardBox>
  );
};
