import React from "react";
import { assertNever } from "common/util";
import { currencyFormatter } from "common/formatters/number";
import { GraphsContainer, TabProps, TabRoot } from "./common";
import { SnapshotGraph } from "./snapshot-graph";

export const EconomyTab: React.FC<TabProps> = ({ socket, counter }) => {
  const { snapshots } = socket;
  return (
    <TabRoot>
      <GraphsContainer>
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Debt vs Est. Income Per Turn"
          valueFormatter={currencyFormatter}
          counter={counter}
          data={snapshots.getData("property-value-debt-income")}
          keys={["debt", "income"]}
          chartId="eco-debt-income"
          lineType={"basis"}
          yAxisLabel="Amount"
          lineLabelFunction={p => {
            const key = p as "debt" | "income";
            switch (key) {
              case "debt":
                return "Total Debt";
              case "income":
                return "Total Income Per Turn";
              default:
                assertNever(key);
            }
            throw new Error("fell through");
          }}
        />
      </GraphsContainer>
    </TabRoot>
  );
};
