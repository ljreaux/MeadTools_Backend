const express = require("express");
const yeastsRouter = express.Router();

yeastsRouter.get("/", async (req, res) => {
  res.send("testing get all yeasts");
});
yeastsRouter.post("/", async (req, res) => {
  res.send("testing add yeast");
});
yeastsRouter.get("/brand/:brandName", async (req, res) => {
  res.send("testing get yeasts by brand: " + req.params.brandName);
});
yeastsRouter.get("/:yeastName", async (req, res) => {
  res.send("testing get yeast with the name: " + req.params.yeastName);
});
yeastsRouter.patch("/:yeastName", async (req, res) => {
  res.send("testing patch yeast with the name: " + req.params.yeastName);
});
yeastsRouter.delete("/:yeastName", async (req, res) => {
  res.send("testing delete yeast with the name: " + req.params.yeastName);
});

module.exports = yeastsRouter;
