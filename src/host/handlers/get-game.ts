import { RequestHandler } from "express";
import { HumanOrComputerPlayerType } from "common/config/types";
import { CreateGameResponse } from "common/shared/types";
import { assertIsDefined } from "common/util";
import { serializeGamePlayer } from "./serialization";
import { GameStore } from "./socket/store";

export const getGetGameHandler = (store: GameStore) => {
  const getGameHandler: RequestHandler<{ id: string }, CreateGameResponse> = (req, res) => {
    const { id: gameId } = req.params;
    const params = store.getGameOriginalParams(gameId);
    const game = store.getGame(gameId);
    assertIsDefined(params, `Game with ID ${gameId} not found`);
    assertIsDefined(game, `Game with ID ${gameId} not found`);
    const data: CreateGameResponse = {
      keys: {},
      gameId,
      observer: serializeGamePlayer({ gameId, playerId: null }),
    };
    params.players.forEach(({ id, type }) => {
      if (type !== HumanOrComputerPlayerType.Human) {
        return;
      }
      if (!game.state.playerStore.get(id)) {
        // if player hasn't been registered yet
        const key = serializeGamePlayer({
          gameId,
          playerId: id,
        });
        data.keys[id] = key;
      }
    });
    res.send(data);
  };
  return getGameHandler;
};
