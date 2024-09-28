"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const iSpindelRouter = express_1.default.Router();
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
exports.default = iSpindelRouter;
