import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const { PORT = 3000 } = process.env;
const server: Express = express();

server.use(cors());

import bodyParser from "body-parser";
server.use(bodyParser.json({ limit: "50mb" }));

import apiRouter from "./api/index";
server.use("/api", apiRouter);
import { client } from "./db/index";
client.connect();

server.use("*", (req: Request, res: Response) => {
  res.redirect("/api/");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
