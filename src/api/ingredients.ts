import express from "express";
const ingredientsRouter = express.Router();
import {
  getAllIngredients,
  getIngredientsByCategory,
  getIngredientByName,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../db/index";
import { requireAdmin } from "./utils";

ingredientsRouter.get("/", async (req, res, next) => {
  try {
    const ingredients = await getAllIngredients();
    res.send(ingredients);
  } catch (err) {
    next(err);
  }
});
ingredientsRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { body } = req;
    const newIngredient = await createIngredient(body);
    res.send(newIngredient);
  } catch (err) {
    next(err);
  }
});
ingredientsRouter.get("/category/:categoryName", async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    const ingredients = await getIngredientsByCategory(categoryName);
    res.send(ingredients);
  } catch (err) {
    next(err);
  }
});

ingredientsRouter.get("/:ingredientName", async (req, res, next) => {
  try {
    const { ingredientName } = req.params;
    const ingredient = await getIngredientByName(ingredientName);
    res.send(ingredient);
  } catch (err) {
    next(err);
  }
});
ingredientsRouter.patch(
  "/:ingredientId",
  requireAdmin,
  async (req, res, next) => {
    try {
      const { ingredientId: id } = req.params;
      const { body: fields } = req;
      const updatedIngredient = await updateIngredient(id, fields);
      res.send(updatedIngredient);
    } catch (err) {
      next(err);
    }
  }
);
ingredientsRouter.delete(
  "/:ingredientId",
  requireAdmin,
  async (req, res, next) => {
    try {
      const { ingredientId: id } = req.params;
      const deletedIngredient = await deleteIngredient(id);
      res.send({
        name: "Success",
        message: `${deletedIngredient.name} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default ingredientsRouter;
