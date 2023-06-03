import { PlayerId } from "common/state/types";
import { IPlayerStore } from "common/store/types";

export const getPlayerNameGenerator =
  (playerStore: IPlayerStore) =>
  (playerId: string): string => {
    const player = playerStore.get(playerId as PlayerId);
    const { id, emoji } = player;
    return `${id} (${emoji})`;
  };
