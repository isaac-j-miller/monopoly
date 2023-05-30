import { PlayerId } from "common/state/types";

export type CreateGameResponse = {
  keys: Record<PlayerId, SerializedGamePlayer>;
};

export type GamePlayer = {
  gameId: string;
  playerId: PlayerId;
};

export type SerializedGamePlayer = `${string}.${string}`;
