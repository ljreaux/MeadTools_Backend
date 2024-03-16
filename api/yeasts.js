const express = require("express");
const yeastsRouter = express.Router();
const {
  getAllYeasts,
  getYeastByBrand,
  getYeastByName,
  createYeast,
  updateYeast,
  deleteYeast,
} = require("../db");
const { requireAdmin } = require("./utils");

yeastsRouter.get("/", async (req, res) => {
  try {
    const yeasts = await getAllYeasts();
    res.send(yeasts);
  } catch ({ name, message }) {
    res.send({ name, message });
  }
});
yeastsRouter.post("/", requireAdmin, async (req, res) => {
  try {
    const { body } = req;
    const newYeast = await createYeast(body);
    res.send(newYeast);
  } catch ({ name, message }) {
    res.send({ name, message });
  }
});
yeastsRouter.get("/brand/:brandName", async (req, res) => {
  try {
    const { brandName } = req.params;
    const yeast = await getYeastByBrand(brandName);
    res.send(yeast);
  } catch ({ name, message }) {
    res.send({ name, message });
  }
});
yeastsRouter.get("/:yeastName", async (req, res) => {
  try {
    const { yeastName } = req.params;
    const yeast = await getYeastByName(yeastName);
    res.send(yeast);
  } catch ({ name, message }) {
    res.send({ name, message });
  }
});
yeastsRouter.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { body: fields } = req;
    const updatedYeast = await updateYeast(id, fields);
    res.send(updatedYeast);
  } catch ({ name, message }) {
    res.send({ name, message });
  }
});
yeastsRouter.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedYeast = await deleteYeast(id);
    res.send({
      name: "Success",
      message: `${deletedYeast.name} has been deleted.`,
    });
  } catch ({ name, message }) {
    res.send({ name, message });
  }
});

module.exports = yeastsRouter;
