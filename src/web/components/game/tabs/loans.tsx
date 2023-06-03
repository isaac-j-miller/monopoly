import React from "react";
import { percentageFormatter } from "common/formatters/number";
import { GraphsContainer, TabProps, TabRoot } from "./common";
import { SnapshotGraph } from "./snapshot-graph";
import { SocketStateUpdate } from "common/state/socket";
import { getCurrentAverageInterestRate } from "common/property/upgrades";

const getAverageInterestRate = (key: string, snapshot: SocketStateUpdate): number => {
  switch (key) {
    case "Weighted":
      return getCurrentAverageInterestRate(Object.values(snapshot.loans), true);
    case "Unweighted":
      return getCurrentAverageInterestRate(Object.values(snapshot.loans), false);
    default:
      throw new Error("unexpected value: " + key);
  }
};

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
          snapshots={snapshots}
          keys={["Weighted", "Unweighted"]}
          getValue={getAverageInterestRate}
          chartId="loan-interest-rate"
          lineType={"basis"}
          yAxisLabel="Interest Rate (%)"
          lineLabelFunction={p => p}
        />
      </GraphsContainer>
    </TabRoot>
  );
};
