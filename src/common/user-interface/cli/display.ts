import { IGame } from "common/game/types";
import { RuntimeConfig } from "common/config/types";
import { IDisplay, IUserInput } from "../types";
import { CliBoardDisplay } from "./board";

export class CliDisplay implements IDisplay {
  private game!: IGame;
  private board: CliBoardDisplay;
  constructor(public readonly userInput: IUserInput, config: RuntimeConfig) {
    this.board = new CliBoardDisplay(config);
  }
  async update(): Promise<void> {
    const board = this.board.render();
    const userInput = this.userInput.render();
    const width = this.board.boardConfig.totalHeightWidth;
    const border = "=".repeat(width);
    console.clear();
    console.log(board);
    console.log(border);
    console.log(userInput);
  }
  register(game: IGame): void {
    this.game = game;
    this.board.register(game);
  }
}
