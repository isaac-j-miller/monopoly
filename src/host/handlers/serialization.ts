import crypto from "crypto";
import { PlayerId } from "common/state/types";
import { assertIsDefined } from "common/util";
import type { GamePlayer, SerializedGamePlayer } from "common/shared/types";

type GamePlayerSerializedInner = `${string}:${PlayerId}`;

const key = Buffer.from("l4GNe3Sdo+0L1wNhRoWghr1g", "utf-8");

export function serializeGamePlayer(gamePlayer: GamePlayer): SerializedGamePlayer {
  const iv = crypto.randomBytes(16);
  const data: GamePlayerSerializedInner = `${gamePlayer.gameId}:${gamePlayer.playerId}`;
  const cipher = crypto.createCipheriv("aes192", key, iv);
  let ciphered = cipher.update(data, "utf-8", "hex");
  ciphered += cipher.final("hex");
  return `${iv.toString("hex")}.${ciphered}`;
}

export function deserializeGamePlayerId(id: SerializedGamePlayer): GamePlayer {
  const [iv, data] = id.split(".");
  const ivBuffer = Buffer.from(iv, "hex");
  const cipher = crypto.createDecipheriv("aes192", key, ivBuffer);
  let deciphered = cipher.update(data, "hex", "utf-8");
  deciphered += cipher.final("utf-8");
  const [gameId, playerId] = deciphered.split(":") as [string, PlayerId];
  assertIsDefined(gameId);
  assertIsDefined(playerId);
  return {
    gameId,
    playerId,
  };
}
