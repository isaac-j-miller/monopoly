import React from "react";
import { currencyFormatter } from "common/formatters/number";
import { getPlayerNameGenerator } from "common/formatters/player";
import { CreditRating, PlayerId } from "common/state/types";
import { SocketStateUpdate } from "common/state/socket";
import { GraphsContainer, TabProps, TabRoot } from "./common";
import { SnapshotGraph } from "./snapshot-graph";

const getNetWorth = (key: string, snapshot: SocketStateUpdate): number => {
  const player = key as PlayerId;
  return snapshot.players[player]?.netWorth ?? 0;
};

const getCashOnHand = (key: string, snapshot: SocketStateUpdate): number => {
  const player = key as PlayerId;
  return snapshot.players[player]?.cashOnHand ?? 0;
};
const getCreditRating = (key: string, snapshot: SocketStateUpdate): number => {
  const player = key as PlayerId;
  return snapshot.players[player]?.creditRating ?? 0;
};
export const PlayerTab: React.FC<TabProps> = ({ socket, counter }) => {
  const { snapshots } = socket;
  const { withBank, withoutBank } = React.useMemo(() => {
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
    return {
      withBank: sorted,
      withoutBank: sorted.filter(p => !p.startsWith("Bank_")),
    };
  }, []);
  const playerNameGenerator = React.useMemo(
    () => getPlayerNameGenerator(socket.state.playerStore),
    []
  );
  const creditRatingFormatter = (value: number) => CreditRating[value as CreditRating];

  return (
    <TabRoot>
      <GraphsContainer>
        <SnapshotGraph
          yAxisLabelAdjustment={-60}
          title="Net Worth"
          valueFormatter={currencyFormatter}
          counter={counter}
          snapshots={snapshots}
          keys={withoutBank}
          getValue={getNetWorth}
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
          snapshots={snapshots}
          keys={withoutBank}
          getValue={getCashOnHand}
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
          snapshots={snapshots}
          keys={withoutBank}
          getValue={getCreditRating}
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
