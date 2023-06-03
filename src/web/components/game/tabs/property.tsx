import React from "react";
import { currencyFormatter } from "common/formatters/number";
import { PositionType } from "common/board/types";
import { SocketStateUpdate } from "common/state/socket";
import { GraphsContainer, TabProps, TabRoot } from "./common";
import { SnapshotGraph } from "./snapshot-graph";
import { getTotalDebt } from "./value-functions";

const getPropertyValueVsTotalDebt = (key: string, snapshot: SocketStateUpdate): number => {
  if (key == "debt") {
    return getTotalDebt(snapshot);
  }
  const { totalValue } = getTotalPropertyValue(key, snapshot);
  return totalValue;
};

const getTotalPropertyValue = (key: string, snapshot: SocketStateUpdate) => {
  const propertyType = Number.parseInt(key) as
    | PositionType.Property
    | PositionType.Railroad
    | PositionType.Utility;
  let totalValue = 0;
  let count = 0;
  Object.values(snapshot.properties).forEach(property => {
    if (property.propertyType !== propertyType) {
      return;
    }
    totalValue += property.marketValue;
    count++;
  });
  return { totalValue, count };
};

const getPropertyValue = (key: string, snapshot: SocketStateUpdate): number => {
  const { totalValue, count } = getTotalPropertyValue(key, snapshot);
  return totalValue / count;
};

const getPropertyTypeLabel = (key: string): string => {
  const num = Number.parseInt(key) as
    | PositionType.Property
    | PositionType.Railroad
    | PositionType.Utility;
  return PositionType[num];
};

export const PropertyTab: React.FC<TabProps> = ({ socket, counter }) => {
  const { snapshots } = socket;
  return (
    <TabRoot>
      <GraphsContainer>
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Avg Property Value by Type"
          valueFormatter={currencyFormatter}
          counter={counter}
          snapshots={snapshots}
          keys={[PositionType.Property, PositionType.Utility, PositionType.Railroad].map(String)}
          getValue={getPropertyValue}
          chartId="prop-avg-value"
          lineType={"basis"}
          yAxisLabel="Avg Value"
          lineLabelFunction={getPropertyTypeLabel}
        />
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Property Value vs Debt"
          valueFormatter={currencyFormatter}
          counter={counter}
          snapshots={snapshots}
          keys={["debt", PositionType.Property, PositionType.Utility, PositionType.Railroad].map(
            String
          )}
          getValue={getPropertyValueVsTotalDebt}
          chartId="prop-value-debt"
          lineType={"basis"}
          yAxisLabel="Amount"
          lineLabelFunction={v =>
            v === "debt" ? "Total Debt" : `Total ${getPropertyTypeLabel(v)} Value`
          }
        />
      </GraphsContainer>
    </TabRoot>
  );
};
