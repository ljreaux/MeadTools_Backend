const express = require("express");
const recipesRouter = express.Router();
const {
  createRecipe,
  getAllRecipes,
  getRecipeInfo,
  updateRecipe,
  deleteRecipe,
} = require("../db");
const { requireUser, checkAdmin } = require("./utils");

recipesRouter.get("/", async (req, res) => {
  const recipes = await getAllRecipes();
  res.send({ recipes });
});

recipesRouter.post("/", requireUser, async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const recipe = await createRecipe({ userId, ...req.body });
    console.log("This recipe", recipe);
    res.send({ recipe });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

recipesRouter.get("/:id", requireUser, async (req, res, next) => {
  try {
    const { id: recipeId } = req.params;
    const recipe = await getRecipeInfo(recipeId);

    res.send({ recipe });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

recipesRouter.patch("/:id", requireUser, async (req, res, next) => {
  const { user } = req;
  const admin = checkAdmin(user);

  const { body: fields } = req;
  try {
    const { id } = req.params;
    const { user_id: userId } = await getRecipeInfo(id);

    if (userId != user.id && !admin) {
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
});

recipesRouter.delete("/:id", requireUser, async (req, res, next) => {
  const { user } = req;
  const admin = checkAdmin(user);

  const { id } = req.params;
  try {
    const { user_id: userId, name } = await getRecipeInfo(id);

    if (userId != user.id && !admin) {
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
});

module.exports = recipesRouter;
