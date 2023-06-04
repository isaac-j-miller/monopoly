import { SocketStateUpdate } from "common/state/socket";

export type DataPoint = {
    x: number;
  } & Record<string, number>;
  
export type DataGenerator = {
    name: string;
    getDatapoint(snapshot: SocketStateUpdate): DataPoint;
}

export class SnapshotProcessor {
    private lines: Record<string, DataPoint[]>;
    constructor(private dataGenerators: DataGenerator[], private readonly incrementCounter: ()=>void) {
        this.lines = {}
        dataGenerators.forEach(({name})=> {
            this.lines[name] = []
        })
    }
    processSnapshot = (snapshot: SocketStateUpdate) => {
        this.dataGenerators.forEach(({name, getDatapoint}) => {
            this.lines[name][snapshot.turn] = getDatapoint(snapshot);
        });
        this.incrementCounter()
    }
    getData(name: string): DataPoint[] {
        return this.lines[name];
    }
}