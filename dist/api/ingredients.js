"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ingredientsRouter = express_1.default.Router();
const index_1 = require("../db/index");
const utils_1 = require("./utils");
ingredientsRouter.get("/", async (req, res, next) => {
    try {
        const ingredients = await (0, index_1.getAllIngredients)();
        res.send(ingredients);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
ingredientsRouter.post("/", utils_1.requireAdmin, async (req, res, next) => {
    try {
        const { body } = req;
        console.log(body);
        const newIngredient = await (0, index_1.createIngredient)(body);
        res.send(newIngredient);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
ingredientsRouter.get("/category/:categoryName", async (req, res, next) => {
    try {
        const { categoryName } = req.params;
        const ingredients = await (0, index_1.getIngredientsByCategory)(categoryName);
        res.send(ingredients);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
ingredientsRouter.get("/:ingredientName", async (req, res, next) => {
    try {
        const { ingredientName } = req.params;
        const ingredient = await (0, index_1.getIngredientByName)(ingredientName);
        res.send(ingredient);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
ingredientsRouter.patch("/:ingredientId", utils_1.requireAdmin, async (req, res, next) => {
    try {
        const { ingredientId: id } = req.params;
        const { body: fields } = req;
        const updatedIngredient = await (0, index_1.updateIngredient)(id, fields);
        res.send(updatedIngredient);
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
ingredientsRouter.delete("/:ingredientId", utils_1.requireAdmin, async (req, res, next) => {
    try {
        const { ingredientId: id } = req.params;
        const deletedIngredient = await (0, index_1.deleteIngredient)(id);
        res.send({
            name: "Success",
            message: `${deletedIngredient.name} has been deleted`,
        });
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
exports.default = ingredientsRouter;
