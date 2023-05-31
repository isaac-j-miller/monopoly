import { RequestHandler } from "express";
import { GameConfigParams, HumanOrComputerPlayerType } from "common/config/types";
import { CreateGameResponse } from "common/shared/types";
import { serializeGamePlayer } from "./serialization";
import { GameStore } from "./socket/store";

export const getCreateGameHandler = (store: GameStore) => {
  const createGameHandler: RequestHandler<unknown, CreateGameResponse, GameConfigParams> = (
    req,
    res
  ) => {
    const gameId = store.createGame(req.body);
    const data: CreateGameResponse = {
      keys: {},
    };
    req.body.players.forEach(({ id, type }) => {
      if (type !== HumanOrComputerPlayerType.Human) {
        return;
      }
      const key = serializeGamePlayer({
        gameId,
        playerId: id,
      });
      data.keys[id] = key;
    });
    res.send(data);
    console.log(`created game with id ${gameId}`);
  };
  return createGameHandler;
};
