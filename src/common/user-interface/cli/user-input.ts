import readline from "readline/promises";
import { Writable } from "stream";
import { IUserInput } from "../types";
import { IPlayer } from "common/player/types";
import { IGame } from "common/game/types";

const booleanTransformer = (s: string): boolean => {
  const lower = s.toLocaleLowerCase();
  if (["true", "1", "yes"].includes(lower)) {
    return true;
  }
  if (["false", 0, "no"].includes(lower)) {
    return false;
  }
  throw new Error("invalid");
};
const stringTransformer = (s: string): string => {
  return s;
};
const numberTransformer = (s: string): number => {
  const parsed = Number(s.trim());
  if (Number.isNaN(parsed)) {
    throw new Error("invalid");
  }
  return parsed;
};
export class CliUserInput implements IUserInput {
  private promptText?: string;
  private stream: Writable;
  private readline: readline.Interface;
  private player!: IPlayer;
  private game!: IGame;
  constructor() {
    this.stream = new Writable();
    this.stream.on("pipe", readable => {
      readable.setEncoding("utf-8");
      this.promptText = readable.read();
    });
    this.readline = readline.createInterface({
      input: process.stdin,
      output: this.stream,
    });
  }
  register(game: IGame, player: IPlayer) {
    this.game = game;
    this.player = player;
  }
  render(): string {
    // TODO: show more info
    if (this.promptText) {
      return this.promptText;
    }
    return "";
  }
  private async prompt<T>(question: string, transformer: (s: string) => T): Promise<T> {
    const value = await this.readline.question(question);
    try {
      return transformer(value);
    } catch (err) {
      if ((err as Error).message === "invalid") {
        return this.prompt(question, transformer);
      }
      throw err;
    }
  }
  async promptBoolean(question: string): Promise<boolean> {
    return this.prompt(question, booleanTransformer);
  }
  async promptNumber(question: string): Promise<number> {
    return this.prompt(question, numberTransformer);
  }
  async promptString(question: string): Promise<string> {
    return this.prompt(question, stringTransformer);
  }
}
