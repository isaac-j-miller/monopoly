import { Socket } from "socket.io-client";
import { GameState, PlayerId } from "common/state/types";
import { IPlayer } from "common/player/types";
import {
  DecisionMakerTask,
  DecisionMakerTaskEvent,
  DecisionMakerTaskEventResponseType,
} from "common/shared/types";
import { RuntimeConfig } from "common/config/types";

const defaultTask: DecisionMakerTaskEvent<DecisionMakerTask> = {
  taskType: DecisionMakerTask.None,
  event: null,
  id: "",
};
export class HumanRemoteInterface {
  private currentTask: DecisionMakerTaskEvent<DecisionMakerTask>;
  private index: number;
  constructor(
    readonly config: RuntimeConfig,
    private readonly socket: Socket,
    private readonly socketCounter: () => number,
    private readonly incrementCounter: () => void,
    readonly gameState: () => GameState,
    readonly playerId: PlayerId
  ) {
    this.currentTask = defaultTask;
    this.index = gameState().playerTurnOrder.findIndex(p => p === this.playerId);
  }
  get counter(): number {
    return this.socketCounter();
  }
  get player(): IPlayer {
    return this.gameState().playerStore.get(this.playerId);
  }
  isCurrentPlayerTurn() {
    return this.gameState().currentPlayerTurn === this.index;
  }
  getTask(): DecisionMakerTaskEvent<DecisionMakerTask> {
    return this.currentTask;
  }
  setup() {
    const { socket } = this;
    socket.on("SET_DECISION_MAKER_TASK", (task: DecisionMakerTaskEvent<DecisionMakerTask>) => {
      console.debug(`Got user task: ${DecisionMakerTask[task.taskType]}[${task.id}]`, task.event);
      this.currentTask = task;
      this.incrementCounter();
    });
  }
  completeCurrentTask<T extends DecisionMakerTask>(
    response: DecisionMakerTaskEventResponseType[T]
  ) {
    if (this.currentTask.id === defaultTask.id) {
      return;
    }
    const { id } = this.currentTask;
    const eventName = `CLOSE_DECISION_MAKER_TASK_${id}`;
    this.socket.emit(eventName, response);
    this.currentTask = defaultTask;
  }
  startGame() {
    this.socket.emit("START_GAME");
  }
  isStarted() {
    return this.gameState().started;
  }
  // TODO: write methods for sending events to the backend
}
