import React from "react";
import { percentageFormatter } from "common/formatters/number";
import { GraphsContainer, TabProps, TabRoot } from "./common";
import { SnapshotGraph } from "./snapshot-graph";

export const LoansTab: React.FC<TabProps> = ({ socket, counter }) => {
  const { snapshots } = socket;
  return (
    <TabRoot>
      <GraphsContainer>
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Average Loan Interest Rate"
          valueFormatter={percentageFormatter}
          counter={counter}
          data={snapshots.getData("avg-loan-rate")}
          keys={["weighted", "unweighted"]}
          chartId="loan-interest-rate"
          lineType={"basis"}
          yAxisLabel="Interest Rate (%)"
          lineLabelFunction={p => p[0].toUpperCase() + p.slice(1)}
        />
      </GraphsContainer>
    </TabRoot>
  );
};
