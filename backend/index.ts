import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const { PORT = 8080 } = process.env;
const server: Express = express();

server.use(cors());

import bodyParser from "body-parser";
server.use(bodyParser.json({ limit: "50mb" }));

import apiRouter from "./api/index";
server.use("/api", apiRouter);
apiRouter.use(
  (error: Error, req: Request, res: Response, next: NextFunction): void => {
    res.send(error);
  }
);
import { client } from "./db/index";
client.connect();

server.use("*", (req: Request, res: Response) => {
  res.redirect("/api/");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});