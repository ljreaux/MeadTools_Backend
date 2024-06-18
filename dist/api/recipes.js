"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recipesRouter = express_1.default.Router();
const index_1 = require("../db/index");
const utils_1 = require("./utils");
recipesRouter.get("/", async (req, res) => {
    const recipes = await (0, index_1.getAllRecipes)();
    res.send({ recipes });
});
recipesRouter.post("/", utils_1.requireUser, async (req, res) => {
    console.log(req);
    try {
        const { id: userId } = req.user || { id: null };
        const recipe = await (0, index_1.createRecipe)({ userId, ...req.body });
        console.log(recipe);
        res.send({ recipe });
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
});
recipesRouter.get("/:id", utils_1.requireUser, async (req, res) => {
    try {
        const { id: recipeId } = req.params;
        const recipe = await (0, index_1.getRecipeInfo)(recipeId);
        res.send({ recipe });
    }
    catch (err) {
        res.send(err);
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
            console.log("in error");
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
    catch (err) {
        res.send(err);
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
    catch (err) {
        res.send(err);
    }
});
exports.default = recipesRouter;
