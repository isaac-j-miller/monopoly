import React from "react";
import { currencyFormatter } from "common/formatters/number";
import { GraphsContainer, TabProps, TabRoot } from "./common";
import { SnapshotGraph } from "./snapshot-graph";

const getPropertyTypeLabel = (key: string): string => {
  return key[0].toUpperCase() + key.slice(1)
};

const nameMap: Record<string, string> = {
  propertyAvg: "Average Property Value",
  railroadAvg: "Average Railroad Value",
  utilityAvg: "Average Utility Value",
  avg: "Weighted Average Value"
}

export const PropertyTab: React.FC<TabProps> = ({ socket, counter }) => {
  const { snapshots } = socket;
  const data = snapshots.getData("property-value-debt-income")
  return (
    <TabRoot>
      <GraphsContainer>
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Avg Property Value by Type"
          valueFormatter={currencyFormatter}
          counter={counter}
          data={data}
          keys={["propertyAvg", "railroadAvg", "utilityAvg", "avg"]}
          chartId="prop-avg-value"
          lineType={"basis"}
          yAxisLabel="Avg Value"
          lineLabelFunction={k=>nameMap[k]}
        />
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Property Value vs Debt"
          valueFormatter={currencyFormatter}
          counter={counter}
          data={data}
          keys={["debt", "total", "property", "utility", "railroad"]}
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
