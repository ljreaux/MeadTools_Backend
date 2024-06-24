import express from "express";
const recipesRouter = express.Router();
import { UserAuthInfoRequest } from ".";

import {
  createRecipe,
  getAllRecipes,
  getRecipeInfo,
  updateRecipe,
  deleteRecipe,
} from "../db/index";
import { requireUser, checkAdmin } from "./utils";

recipesRouter.get("/", async (req, res) => {
  const recipes = await getAllRecipes();
  res.send({ recipes });
});

recipesRouter.post(
  "/",
  requireUser,
  async (req: UserAuthInfoRequest, res, next) => {
    try {
      const { id: userId } = req.user || { id: null };
      const recipe = await createRecipe({ userId, ...req.body });
      console.log(recipe);
      res.send({ recipe });
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

recipesRouter.get(
  "/:id",
  requireUser,
  async (req: UserAuthInfoRequest, res, next) => {
    try {
      const { id: recipeId } = req.params;
      const recipe = await getRecipeInfo(recipeId);

      res.send({ recipe });
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

recipesRouter.patch(
  "/:id",
  requireUser,
  async (req: UserAuthInfoRequest, res, next) => {
    const { user } = req;
    const admin = checkAdmin(user);

    const { body: fields } = req;
    try {
      const { id } = req.params;
      const { user_id: userId } = await getRecipeInfo(id);

      if (user && userId != user.id && !admin) {
        console.log("in error");
        next({
          name: "UnauthorizedError",
          message: "You are not authorized to perform this action",
        });
      } else {
        const updatedRecipe = await updateRecipe(id, fields);
        res.send({ updatedRecipe });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

recipesRouter.delete(
  "/:id",
  requireUser,
  async (req: UserAuthInfoRequest, res, next) => {
    const { user } = req;
    const admin = checkAdmin(user);

    const { id } = req.params;
    try {
      const { user_id: userId, name } = await getRecipeInfo(id);

      if (user && userId != user.id && !admin) {
        next({
          name: "UnauthorizedError",
          message: "You are not authorized to perform this action",
        });
      } else {
        const deletedRecipe = await deleteRecipe(id);
        res.send({
          name: "success",
          message: `${name} has been successfully deleted.`,
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

export default recipesRouter;
