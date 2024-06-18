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

ingredientsRouter.get("/", async (req, res) => {
  try {
    const ingredients = await getAllIngredients();
    res.send(ingredients);
  } catch (err) {
    res.send(err);
  }
});
ingredientsRouter.post("/", requireAdmin, async (req, res) => {
  try {
    const { body } = req;
    const newIngredient = await createIngredient(body);
    res.send(newIngredient);
  } catch (err) {
    res.send(err);
  }
});
ingredientsRouter.get("/category/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const ingredients = await getIngredientsByCategory(categoryName);
    res.send(ingredients);
  } catch (err) {
    res.send(err);
  }
});

ingredientsRouter.get("/:ingredientName", async (req, res) => {
  try {
    const { ingredientName } = req.params;
    const ingredient = await getIngredientByName(ingredientName);
    res.send(ingredient);
  } catch (err) {
    res.send(err);
  }
});
ingredientsRouter.patch("/:ingredientId", requireAdmin, async (req, res) => {
  try {
    const { ingredientId: id } = req.params;
    const { body: fields } = req;
    const updatedIngredient = await updateIngredient(id, fields);
    res.send(updatedIngredient);
  } catch (err) {
    res.send(err);
  }
});
ingredientsRouter.delete("/:ingredientId", requireAdmin, async (req, res) => {
  try {
    const { ingredientId: id } = req.params;
    const deletedIngredient = await deleteIngredient(id);
    res.send({
      name: "Success",
      message: `${deletedIngredient.name} has been deleted`,
    });
  } catch (err) {
    res.send(err);
  }
});

export default ingredientsRouter;
