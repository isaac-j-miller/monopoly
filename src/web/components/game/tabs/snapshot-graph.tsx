import React from "react";
import { CurveType } from "recharts/types/shape/Curve";
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
import { getRuntimeConfig } from "common/config";

export type SnapshotsGraphProps = {
  counter: number;
  chartId: string;
  keys: string[];
  snapshots: SocketStateUpdate[];
  lineType: CurveType;
  yAxisLabel: string;
  title: string;
  yAxisRange?: [number, number];
  yAxisIncrement?: number;
  yAxisLabelAdjustment: number;
  lineLabelFunction: (key: string) => string;
  valueFormatter: (value: number) => string;
  getValue: (key: string, snapshot: SocketStateUpdate) => number;
};

type DataPoint = {
  x: number;
} & Record<string, number>;

export const SnapshotGraph: React.FC<SnapshotsGraphProps> = ({
  yAxisIncrement,
  yAxisRange,
  yAxisLabelAdjustment,
  title,
  snapshots,
  keys,
  lineType,
  yAxisLabel,
  getValue,
  valueFormatter,
  chartId,
  lineLabelFunction,
}) => {
  // TODO: get dynamic color from game config
  const config = React.useMemo(() => getRuntimeConfig(), []);
  const datapoints: DataPoint[] = [];

  snapshots.forEach(snapshot => {
    if (!snapshot) {
      return;
    }
    const point: DataPoint = { x: snapshot.turn };
    keys.forEach(key => {
      const value = getValue(key, snapshot);
      point[key] = value;
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
        top: 40,
        bottom: 50,
        left: 80,
        right: 10,
      }}
      title={title}
      data={datapoints}
    >
      <text x={460} y={10} fill="black" textAnchor="middle" dominantBaseline="central">
        <tspan fontSize="18">{title}</tspan>
      </text>
      {keys.map((key, i) => (
        <Line
          type={lineType}
          dataKey={key}
          key={chartId + "_" + key + "_line"}
          name={lineLabelFunction(key)}
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
