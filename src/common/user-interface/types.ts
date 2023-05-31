import { IGame } from "common/game/types";

export interface IUserInput {
  promptBoolean(question: string): Promise<boolean>;
  promptNumber(question: string): Promise<number>;
  promptString(question: string): Promise<string>;
  render(): string;
}

export interface IDisplay {
  register(game: IGame): void;
}
