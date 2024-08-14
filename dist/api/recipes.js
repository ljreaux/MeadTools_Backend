"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recipesRouter = express_1.default.Router();
const index_1 = require("../db/index");
const utils_1 = require("./utils");
recipesRouter.get("/", utils_1.requireAdmin, async (req, res) => {
    const recipes = await (0, index_1.getAllRecipes)();
    res.send({ recipes });
});
recipesRouter.post("/", utils_1.requireUser, async (req, res, next) => {
    try {
        const { id: userId } = req.user || { id: null };
        const recipe = await (0, index_1.createRecipe)({ userId, ...req.body });
        res.send({ recipe });
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
recipesRouter.get("/:id", utils_1.requireUser, async (req, res, next) => {
    try {
        const { user } = req;
        const admin = (0, utils_1.checkAdmin)(user);
        const { id: recipeId } = req.params;
        const recipe = await (0, index_1.getRecipeInfo)(recipeId);
        if (!recipe.private || admin || user?.id === recipe.user_id)
            res.send({ recipe });
        else
            next({
                name: "UnauthorizedError",
                message: "You are not authorized to perform this action",
            });
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
recipesRouter.patch("/:id", utils_1.requireUser, async (req, res, next) => {
    const { user } = req;
    const admin = (0, utils_1.checkAdmin)(user);
    const { body: fields } = req;
    try {
        const { id } = req.params;
        const { user_id: userId } = await (0, index_1.getRecipeInfo)(id);
        if (user && userId != user.id && !admin) {
            next({
                name: "UnauthorizedError",
                message: "You are not authorized to perform this action",
            });
        }
        else {
            const updatedRecipe = await (0, index_1.updateRecipe)(id, fields);
            res.send({ updatedRecipe });
        }
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
recipesRouter.delete("/:id", utils_1.requireUser, async (req, res, next) => {
    const { user } = req;
    const admin = (0, utils_1.checkAdmin)(user);
    const { id } = req.params;
    try {
        const { user_id: userId, name } = await (0, index_1.getRecipeInfo)(id);
        if (user && userId != user.id && !admin) {
            next({
                name: "UnauthorizedError",
                message: "You are not authorized to perform this action",
            });
        }
        else {
            const deletedRecipe = await (0, index_1.deleteRecipe)(id);
            res.send({
                name: "success",
                message: `${name} has been successfully deleted.`,
            });
        }
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
exports.default = recipesRouter;
