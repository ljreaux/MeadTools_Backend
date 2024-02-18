const express = require("express");
const ingredientsRouter = express.Router();

ingredientsRouter.get("/", async (req, res) => {
  res.send("testing get all ingredients");
});
ingredientsRouter.post("/", async (req, res) => {
  res.send("testing add ingredient");
});
ingredientsRouter.get("/category/:categoryName", async (req, res) => {
  res.send("testing get ingredients by category: " + req.params.categoryName);
});

ingredientsRouter.get("/:ingredientName", async (req, res) => {
  res.send(
    "testing get ingredient with the name: " + req.params.ingredientName
  );
});
ingredientsRouter.patch("/:ingredientName", async (req, res) => {
  res.send(
    "testing patch ingredient with the name: " + req.params.ingredientName
  );
});
ingredientsRouter.delete("/:ingredientName", async (req, res) => {
  res.send(
    "testing delete ingredient with the name: " + req.params.ingredientName
  );
});

module.exports = ingredientsRouter;
