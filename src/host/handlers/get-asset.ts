import path from "path";
import fs from "fs";
import { RequestHandler } from "./wrapper";
import {Request, Response} from "express";
import { ViteDevServer } from "vite";

export const getWebIndexHandler = (vite: ViteDevServer): RequestHandler => (req, res) => {
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
  }

export const getWebAsset = (vite: ViteDevServer): RequestHandler => (req: Request<{ asset: string }>, res) => {
    const { asset } = req.params;
    const assetPath = path.join(vite.config.root, "assets", asset);
    res.sendFile(assetPath);
  }