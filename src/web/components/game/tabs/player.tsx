import React from "react";
import { currencyFormatter } from "common/formatters/number";
import { getPlayerNameGenerator } from "common/formatters/player";
import { CreditRating } from "common/state/types";
import { GraphsContainer, TabProps, TabRoot } from "./common";
import { SnapshotGraph } from "./snapshot-graph";

const creditRatingFormatter = (value: number) => CreditRating[value as CreditRating];

export const PlayerTab: React.FC<TabProps> = ({ socket, counter }) => {
  const { snapshots } = socket;
  const playerNameGenerator = React.useMemo(
    () => getPlayerNameGenerator(socket.state.playerStore),
    []
  );
  const withoutBank = React.useMemo(() => {
    const players = socket.state.playerStore.allPlayerIds();
    const sorted = [
      ...players.sort((a, b) => {
        const aIsBank = a.startsWith("Bank_");
        const bIsBank = b.startsWith("Bank_");
        if (aIsBank && !bIsBank) {
          return 1;
        }
        if (bIsBank && !aIsBank) {
          return -1;
        }
        return a > b ? 1 : -1;
      }),
    ];
    return sorted.filter(p => !p.startsWith("Bank_"))
  }, []);
  return (
    <TabRoot>
      <GraphsContainer>
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Net Worth"
          valueFormatter={currencyFormatter}
          counter={counter}
          data={snapshots.getData("net-worth")}
          keys={withoutBank}
          chartId="eco-networth"
          lineType={"basis"}
          yAxisLabel="Player Net Worth"
          lineLabelFunction={playerNameGenerator}
        />
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Cash On Hand"
          valueFormatter={currencyFormatter}
          counter={counter}
          data={snapshots.getData("cash-on-hand")}
          keys={withoutBank}
          chartId="eco-networth"
          lineType={"basis"}
          yAxisLabel="Player Cash On Hand"
          lineLabelFunction={playerNameGenerator}
        />
        <SnapshotGraph
          yAxisLabelAdjustment={-20}
          title="Credit Rating"
          valueFormatter={creditRatingFormatter}
          counter={counter}
          data={snapshots.getData("credit-rating")}
          keys={withoutBank}
          chartId="eco-creditrating"
          lineType={"linear"}
          yAxisLabel="Player Credit Rating"
          yAxisIncrement={1}
          yAxisRange={[CreditRating.D, CreditRating.AAA]}
          lineLabelFunction={playerNameGenerator}
        />
      </GraphsContainer>
    </TabRoot>
  );
};
