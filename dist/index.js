"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { PORT = 8080 } = process.env;
const server = (0, express_1.default)();
server.use((0, cors_1.default)());
const body_parser_1 = __importDefault(require("body-parser"));
server.use(body_parser_1.default.json({ limit: "50mb" }));
const index_1 = __importDefault(require("./api/index"));
server.use("/api", index_1.default);
index_1.default.use((error, req, res, next) => {
    res.send(error);
});
const index_2 = require("./db/index");
index_2.client.connect();
server.use("*", (req, res) => {
    res.redirect("/api/");
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
