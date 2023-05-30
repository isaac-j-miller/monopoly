import path from "path";
import http from "http";
import fs from "fs";
import { Server } from "socket.io";
import express, { Request } from "express";
import { getVite } from "./handlers/vite";
import { handleGameSocketConnection } from "./handlers/socket/handler";
import { GameStore } from "./handlers/socket/store";
import { getRuntimeConfig } from "common/config";
import { getCreateGameHandler } from "./handlers/create-game";
import { parseKey } from "./handlers/parse-key";

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
  app.get(["/", "/game/:id"], (req, res) => {
    const filePath = path.join(vite.config.root, "assets/index.html");
    fs.readFile(
      filePath,
      {
        encoding: "utf-8",
      },
      (err, data) => {
        if (err) {
          // TODO: error codes
          res.status(400);
          console.error(err);
          res.send();
        } else {
          vite
            .transformIndexHtml(req.url, data)
            .then(v => {
              res.setHeader("Content-Type", "text/html");
              res.send(v);
            })
            .catch((err: Error) => {
              res.status(500);
              console.error(err);
              res.send();
            });
        }
      }
    );
  });
  app.get("/assets/:asset(*)", (req: Request<{ asset: string }>, res) => {
    const { asset } = req.params;
    const assetPath = path.join(vite.config.root, "assets", asset);
    res.sendFile(assetPath);
  });
  const io = new Server(server, {});
  const gameStore = new GameStore(config, io);
  const createGameHandler = getCreateGameHandler(gameStore);
  app.post("/api/create-game", createGameHandler);
  app.get("/api/parse-key/:key", parseKey);
  io.on("connection", socket => handleGameSocketConnection(gameStore, socket));
  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
  });
};

void main();
