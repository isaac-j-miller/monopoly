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
    const params = store.getGameConfig(req.body);
    store.createGame(params);
    const data: CreateGameResponse = {
      keys: {},
    };
    req.body.players.forEach(({ id, type }) => {
      if (type !== HumanOrComputerPlayerType.Human) {
        return;
      }
      const key = serializeGamePlayer({
        gameId: params.gameId,
        playerId: id,
      });
      data.keys[id] = key;
    });
    res.send(data);
    console.log(`created game with id ${params.gameId}`);
  };
  return createGameHandler;
};
