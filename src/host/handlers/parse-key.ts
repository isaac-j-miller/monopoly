import { RequestHandler } from "express";
import type { GamePlayer, SerializedGamePlayer } from "common/shared/types";
import { deserializeGamePlayerId } from "./serialization";

export const parseKey: RequestHandler<{ key: SerializedGamePlayer }, GamePlayer> = (req, res) => {
  const { key } = req.params;
  const data = deserializeGamePlayerId(key);
  res.send(data);
};
