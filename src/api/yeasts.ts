import express from "express";
const yeastsRouter = express.Router();
import {
  getAllYeasts,
  getYeastByBrand,
  getYeastByName,
  createYeast,
  updateYeast,
  deleteYeast,
} from "../db";
import { requireAdmin } from "./utils";

yeastsRouter.get("/", async (req, res, next) => {
  try {
    const yeasts = await getAllYeasts();
    res.send(yeasts);
  } catch ({ name, message }) {
    next({ name, message });
  }
});
yeastsRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { body } = req;
    const newYeast = await createYeast(body);
    res.send(newYeast);
  } catch ({ name, message }) {
    next({ name, message });
  }
});
yeastsRouter.get("/brand/:brandName", async (req, res, next) => {
  try {
    const { brandName } = req.params;
    const yeast = await getYeastByBrand(brandName);
    res.send(yeast);
  } catch ({ name, message }) {
    next({ name, message });
  }
});
yeastsRouter.get("/:yeastName", async (req, res, next) => {
  try {
    const { yeastName } = req.params;
    const yeast = await getYeastByName(yeastName);
    res.send(yeast);
  } catch ({ name, message }) {
    next({ name, message });
  }
});
yeastsRouter.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body: fields } = req;
    const updatedYeast = await updateYeast(id, fields);
    res.send(updatedYeast);
  } catch ({ name, message }) {
    next({ name, message });
  }
});
yeastsRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedYeast = await deleteYeast(id);
    res.send({
      name: "Success",
      message: `${deletedYeast.name} has been deleted.`,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

export default yeastsRouter;
