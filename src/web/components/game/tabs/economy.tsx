import React, { useRef } from "react";
import * as Plottable from "plottable";
import styled from "@emotion/styled";
import { TabProps, TabRoot } from "./common";
import { SocketStateUpdate } from "common/state/socket";
import { PlayerId } from "common/state/types";

type SnapshotsGraphProps = {
  counter: number;
  chartId: string;
  players: PlayerId[];
  snapshots: SocketStateUpdate[];
  getValue: (playerId: PlayerId, snapshot: SocketStateUpdate) => number;
};

const ChartContainer = styled.div`
  width: max-content;
  height: fit-content;
  border: 1px solid black;
`
const getNetWorth = (player: PlayerId, snapshot: SocketStateUpdate): number => {
  return snapshot.players[player]?.netWorth ?? 0;
};

const PlayersGraph: React.FC<SnapshotsGraphProps> = ({ snapshots, players, getValue, chartId }) => {
  const canvasRef = useRef(null);
  const xScale = new Plottable.Scales.Linear();
  const xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
  xAxis.formatter(Plottable.Formatters.general(0));
  const yScale = new Plottable.Scales.Linear();
  const yAxis = new Plottable.Axes.Numeric(yScale, "left");
  const colorScale = new Plottable.Scales.Color();
  const serieses = players.map(player => {
    const datapoints: Plottable.Point[] = [];
    snapshots.forEach(snapshot => {
      if (!snapshot) {
        return;
      }
      const value = getValue(player, snapshot);
      const data = { x: snapshot.turn, y: value };
      datapoints.push(data);
    });
    console.log(`Created series for ${player} with length ${datapoints.length}`)
    const series = new Plottable.Dataset(datapoints, { name: player });
    return series;
  });
  const plot = new Plottable.Plots.Line();
  plot.x((d: Plottable.Point) => d.x, xScale).y((d: Plottable.Point) => d.y, yScale);
  plot.attr(
    "stroke",
    (d: Plottable.Point, i: number, dataset: Plottable.Dataset) => dataset.metadata().name,
    colorScale
  );
  serieses.forEach(series => {
    plot.addDataset(series);
  });
  plot.autorangeMode("y");

  const pzi = new Plottable.Interactions.PanZoom(xScale, undefined);
  pzi.attachTo(plot);

  var chart = new Plottable.Components.Table([
    [yAxis, plot],
    [null, xAxis],
  ]);
  chart.rowWeight(2, 0.2);
  if (canvasRef.current) {
    console.log("rendering chart " + chartId)
    chart.renderTo(canvasRef.current);
  }
  return <ChartContainer id={chartId} ref={canvasRef}/>;
};

export const EconomyTab: React.FC<TabProps> = ({ socket, counter }) => {
  const { snapshots } = socket;
  const players = socket.state.playerStore.allNonBankPlayerIds();
  return (
    <TabRoot>
      <PlayersGraph
        counter={counter}
        snapshots={snapshots}
        players={players}
        getValue={getNetWorth}
        chartId="eco-networth"
      />
    </TabRoot>
  );
};
