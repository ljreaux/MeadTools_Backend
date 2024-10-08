"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils");
const iSpindelRouter = express_1.default.Router();
const db_1 = require("../db");
iSpindelRouter.get("/", utils_1.requireUser, async (req, res, next) => {
    try {
        const { id: userId } = req.user || { id: null };
        if (!userId)
            throw new Error('User not found');
        const hydrometerToken = await (0, db_1.getHydrometerToken)(userId);
        const devices = await (0, db_1.getDevicesForUser)(userId);
        res.send({ hydrometerToken, devices });
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.post("/", async (req, res, next) => {
    try {
        const { body } = req;
        const userId = await (0, db_1.verifyToken)(body.token);
        if (!userId)
            next({ message: "Token invalid." });
        const device = await (0, db_1.registerDevice)({ userId, device_name: body.name });
        const { coefficients, brew_id } = device;
        let calculated_gravity = null;
        if (!!coefficients.length)
            calculated_gravity = (0, db_1.calcGravity)(coefficients, body.angle);
        const gravity = calculated_gravity ?? body.gravity;
        if (!!brew_id)
            await (0, db_1.updateBrewGravity)(brew_id, gravity);
        const data = {
            ...body,
            calculated_gravity,
            brew_id,
            device_id: device.id,
        };
        const log = await (0, db_1.createLog)(data);
        res.send(log);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.post("/logs", utils_1.requireUser, async (req, res, next) => {
    try {
        const queryParams = req.query;
        const { body } = req;
        const startDate = new Date(queryParams.start_date);
        const endDate = new Date(queryParams.end_date);
        const logs = await (0, db_1.getLogs)(body.device_id, startDate, endDate);
        res.send(logs);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.get("/logs/:brewId", utils_1.requireUser, async (req, res, next) => {
    try {
        const { brewId } = req.params;
        const logs = await (0, db_1.getLogsForBrew)(brewId, req.user?.id);
        res.send(logs);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.patch("/logs/:logId", utils_1.requireUser, async (req, res, next) => {
    try {
        const { body } = req;
        const { logId } = req.params;
        const queryParams = req.query;
        const device_id = queryParams.device_id;
        // finds log, checks if user listed on brewId is userRequesting, then updates log
        const logs = await (0, db_1.updateLog)(logId, body, device_id);
        res.send(logs);
    }
    catch (err) {
        next(err.message);
    }
});
iSpindelRouter.delete("/logs/:logId", utils_1.requireUser, async (req, res, next) => {
    try {
        const { logId } = req.params;
        const queryParams = req.query;
        const device_id = queryParams.device_id;
        // finds log, checks if user listed on brewId is userRequesting, then updates log
        const logs = await (0, db_1.deleteLog)(logId, device_id);
        res.send(logs);
    }
    catch (err) {
        next(err.message);
    }
});
iSpindelRouter.get("/brew", utils_1.requireUser, async (req, res, next) => {
    try {
        const brews = await (0, db_1.getBrews)(req.user?.id);
        res.send(brews);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.post("/brew", utils_1.requireUser, async (req, res, next) => {
    try {
        const { device_id } = req.body;
        const brew = await (0, db_1.startBrew)(device_id, req.user?.id);
        res.send(brew);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.patch("/brew", utils_1.requireUser, async (req, res, next) => {
    try {
        const { device_id, brew_id } = req.body;
        // stop brew and update device table brew_id field to null
        const brew = await (0, db_1.endBrew)(device_id, brew_id, req.user?.id);
        res.send(brew);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.patch("/brew/:brew_id", utils_1.requireUser, async (req, res, next) => {
    try {
        const { brew_id } = req.params;
        const { recipe_id } = req.body;
        // stop brew and update device table brew_id field to null
        const brew = await (0, db_1.addBrewRec)(recipe_id, brew_id, req.user?.id);
        res.send(brew);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.patch("/device/:device_id", utils_1.requireUser, async (req, res, next) => {
    try {
        const { device_id } = req.params;
        const device = await (0, db_1.updateCoeff)(device_id, req.body.coefficients, req.user?.id);
        res.send(device);
    }
    catch (err) {
        next({ error: err.message });
    }
});
iSpindelRouter.post("/register", utils_1.requireUser, async (req, res, next) => {
    try {
        const { id: userId } = req.user || { id: null };
        let token;
        if (userId)
            token = await (0, db_1.createHydrometerToken)(userId);
        else
            throw new Error('User ID not found');
        res.send({ token: token.token });
    }
    catch (err) {
        next({ error: err.message });
    }
});
exports.default = iSpindelRouter;
