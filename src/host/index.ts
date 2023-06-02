import http from "http";
import { Server } from "socket.io";
import express from "express";
import { getVite } from "./handlers/vite";
import { handleGameSocketConnection } from "./handlers/socket/handler";
import { GameStore } from "./handlers/socket/store";
import { getRuntimeConfig } from "common/config";
import { getCreateGameHandler } from "./handlers/create-game";
import { parseKey } from "./handlers/parse-key";
import { getWebAsset, getWebIndexHandler } from "./handlers/get-asset";
import { handlerWrapper } from "./handlers/wrapper";
import { getGetGameHandler } from "./handlers/get-game";

const PORT = Number.parseInt(process.env.PORT ?? "6002");

const main = async () => {
  if (!Number.isSafeInteger(PORT)) {
    throw new Error(`Invalid port: ${PORT}. must be integer`);
  }
  const app = express();
  const server = http.createServer(app);
  const vite = await getVite(PORT);
  const config = getRuntimeConfig();
  app.use(vite.middlewares);
  app.use(express.json());
  const getWebIndex = handlerWrapper(getWebIndexHandler(vite));
  app.get(["/", "/game/:id", "/lobby/:id"], getWebIndex);
  const getWebAssetHandler = handlerWrapper(getWebAsset(vite));
  app.get("/assets/:asset(*)", getWebAssetHandler);
  const io = new Server(server, {});
  const gameStore = new GameStore(config, io);
  const createGameHandler = getCreateGameHandler(gameStore);
  const getGameHandler = getGetGameHandler(gameStore);
  app.post("/api/create-game", handlerWrapper(createGameHandler));
  app.get("/api/game/:id", handlerWrapper(getGameHandler));
  app.get("/api/parse-key/:key", handlerWrapper(parseKey));
  io.on("connection", socket => handleGameSocketConnection(config, gameStore, socket));
  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
};

void main();
