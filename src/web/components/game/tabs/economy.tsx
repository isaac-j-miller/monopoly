import React from "react";
import { CurveType } from "recharts/types/shape/Curve";
import styled from "@emotion/styled";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  YAxisProps,
} from "recharts";
import { SocketStateUpdate } from "common/state/socket";
import { CreditRating, PlayerId } from "common/state/types";
import { getRuntimeConfig } from "common/config";
import { TabProps, TabRoot } from "./common";

type SnapshotsGraphProps = {
  counter: number;
  chartId: string;
  players: PlayerId[];
  snapshots: SocketStateUpdate[];
  lineType: CurveType;
  yAxisLabel: string;
  title: string;
  yAxisRange?: [number, number];
  yAxisIncrement?: number;
  yAxisLabelAdjustment: number;
  valueFormatter: (value: number) => string;
  getValue: (playerId: PlayerId, snapshot: SocketStateUpdate) => number;
  showBank: boolean;
};

const getNetWorth = (player: PlayerId, snapshot: SocketStateUpdate): number => {
  return snapshot.players[player]?.netWorth ?? 0;
};

const getCashOnHand = (player: PlayerId, snapshot: SocketStateUpdate): number => {
  return snapshot.players[player]?.cashOnHand ?? 0;
};
const getCreditRating = (player: PlayerId, snapshot: SocketStateUpdate): number => {
  return snapshot.players[player]?.creditRating ?? 0;
};

type DataPoint = {
  x: number;
} & Record<PlayerId, number>;

const PlayersGraph: React.FC<SnapshotsGraphProps> = ({
  yAxisIncrement,
  yAxisRange,
  yAxisLabelAdjustment,
  title,
  snapshots,
  players,
  lineType,
  yAxisLabel,
  getValue,
  valueFormatter,
  chartId,
  showBank,
}) => {
  // TODO: get dynamic color from game config
  const config = React.useMemo(() => getRuntimeConfig(), []);
  const datapoints: DataPoint[] = [];
  const sortedPlayers = React.useMemo(() => {
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
    if (showBank) {
      return sorted;
    }
    return sorted.filter(p => !p.startsWith("Bank_"));
  }, [players]);
  snapshots.forEach(snapshot => {
    if (!snapshot) {
      return;
    }
    const point: DataPoint = { x: snapshot.turn };
    sortedPlayers.forEach(player => {
      const value = getValue(player, snapshot);
      point[player] = value;
    });
    datapoints.push(point);
  });
  const yAxisProps: Partial<YAxisProps> = {};
  if (yAxisIncrement && yAxisRange) {
    const count = (yAxisRange[1] - yAxisRange[0]) / yAxisIncrement;
    yAxisProps.tickCount = count;
  }
  return (
    <LineChart
      id={chartId}
      width={800}
      height={300}
      margin={{
        top: 10,
        bottom: 50,
        left: 80,
        right: 10,
      }}
      title={title}
      data={datapoints}
    >
      {sortedPlayers.map((player, i) => (
        <Line
          type={lineType}
          dataKey={player}
          key={chartId + "_" + player + "_line"}
          stroke={config.players.colorPool[i]}
          dot={false}
        />
      ))}
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis dataKey="x" label={{ value: "Turn", textAnchor: "middle", dy: 10 }} padding={"gap"} />
      <YAxis
        domain={yAxisRange}
        label={{ value: yAxisLabel, angle: -90, textAnchor: "middle", dx: yAxisLabelAdjustment }}
        tickFormatter={valueFormatter}
      />
      <Tooltip formatter={(value: number | string) => valueFormatter(value as number)} />
      <Legend />
    </LineChart>
  );
};

const GraphsContainer = styled.div`
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
`;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});
const currencyFormatterFn = (value: number) => {
  let suffix = "";
  let divisor = 1;
  const absValue = Math.abs(value);
  if (absValue >= 1e9) {
    suffix = "B";
    divisor = 1e9;
  } else if (absValue >= 1e6) {
    suffix = "M";
    divisor = 1e6;
  } else if (absValue >= 1e3) {
    suffix = "K";
    divisor = 1e3;
  }
  const valueToFormat = value / divisor;
  const formatted = currencyFormatter.format(valueToFormat) + suffix;
  return formatted;
};

export const EconomyTab: React.FC<TabProps> = ({ socket, counter }) => {
  const { snapshots } = socket;
  const players = socket.state.playerStore.allPlayerIds();
  const creditRatingFormatter = (value: number) => CreditRating[value as CreditRating];
  return (
    <TabRoot>
      <GraphsContainer>
        <PlayersGraph
          yAxisLabelAdjustment={-60}
          title="Net Worth"
          valueFormatter={currencyFormatterFn}
          counter={counter}
          snapshots={snapshots}
          players={players}
          getValue={getNetWorth}
          chartId="eco-networth"
          lineType={"basis"}
          yAxisLabel="Player Net Worth"
          showBank={false}
        />
        <PlayersGraph
          yAxisLabelAdjustment={-60}
          title="Cash On Hand"
          valueFormatter={currencyFormatterFn}
          counter={counter}
          snapshots={snapshots}
          players={players}
          getValue={getCashOnHand}
          chartId="eco-networth"
          lineType={"basis"}
          yAxisLabel="Player Cash On Hand"
          showBank={true}
        />
        <PlayersGraph
          yAxisLabelAdjustment={-20}
          title="Credit Rating"
          valueFormatter={creditRatingFormatter}
          counter={counter}
          snapshots={snapshots}
          players={players}
          getValue={getCreditRating}
          chartId="eco-creditrating"
          lineType={"linear"}
          yAxisLabel="Player Credit Rating"
          yAxisIncrement={1}
          yAxisRange={[CreditRating.D, CreditRating.AAA]}
          showBank={false}
        />
      </GraphsContainer>
    </TabRoot>
  );
};
