"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils");
const iSpindelRouter = express_1.default.Router();
const short_unique_id_1 = __importDefault(require("short-unique-id"));
iSpindelRouter.get("/", utils_1.requireUser, async (req, res, next) => {
    try {
        const { id: userId } = req.user || { id: null };
        const { body } = req;
        console.log(body);
        res.send(`Fetching deviceList for user ${userId}`);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.post("/", async (req, res, next) => {
    try {
        const { body } = req;
        console.log(body);
        res.send("iSpindel recipe created successfully!");
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.get("/logs", utils_1.requireUser, async (req, res, next) => {
    try {
        const queryParams = req.query;
        const { id: userId } = req.user || { id: null };
        const { body } = req;
        console.log(body);
        res.send(`Fetching the ${queryParams} most recent logs for user ${userId}`);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.get("/logs/:brewId", utils_1.requireUser, async (req, res, next) => {
    try {
        const { brewId } = req.params;
        const { id: userId } = req.user || { id: null };
        const { body } = req;
        console.log(body);
        res.send(`Fetching user ${userId} logs for brew ${brewId}`);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.get("/:deviceId", utils_1.requireUser, async (req, res, next) => {
    try {
        const { id: userId } = req.user || { id: null };
        const { deviceId } = req.params;
        const { body } = req;
        console.log(body);
        res.send(`Fetching recent logs for device ${deviceId} from user ${userId}`);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.post("/register", utils_1.requireUser, async (req, res, next) => {
    try {
        const { id: userId } = req.user || { id: null };
        const { body } = req;
        console.log(body);
        const { randomUUID } = new short_unique_id_1.default();
        const token = randomUUID(10);
        res.send(`Generating a new token for ${userId}. Your token is ${token}`);
    }
    catch (err) {
        next({ error: err.message });
    }
});
exports.default = iSpindelRouter;
