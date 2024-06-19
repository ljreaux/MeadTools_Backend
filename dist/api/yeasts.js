"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const yeastsRouter = express_1.default.Router();
const db_1 = require("../db");
const utils_1 = require("./utils");
yeastsRouter.get("/", async (req, res, next) => {
    try {
        const yeasts = await (0, db_1.getAllYeasts)();
        res.send(yeasts);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
yeastsRouter.post("/", utils_1.requireAdmin, async (req, res, next) => {
    try {
        const { body } = req;
        const newYeast = await (0, db_1.createYeast)(body);
        res.send(newYeast);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
yeastsRouter.get("/brand/:brandName", async (req, res, next) => {
    try {
        const { brandName } = req.params;
        const yeast = await (0, db_1.getYeastByBrand)(brandName);
        res.send(yeast);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
yeastsRouter.get("/:yeastName", async (req, res, next) => {
    try {
        const { yeastName } = req.params;
        const yeast = await (0, db_1.getYeastByName)(yeastName);
        res.send(yeast);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
yeastsRouter.patch("/:id", utils_1.requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { body: fields } = req;
        const updatedYeast = await (0, db_1.updateYeast)(id, fields);
        res.send(updatedYeast);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
yeastsRouter.delete("/:id", utils_1.requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedYeast = await (0, db_1.deleteYeast)(id);
        res.send({
            name: "Success",
            message: `${deletedYeast.name} has been deleted.`,
        });
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
exports.default = yeastsRouter;
