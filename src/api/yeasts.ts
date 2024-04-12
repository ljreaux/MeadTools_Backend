import express from "express";
const yeastsRouter = express.Router();
import  {
  getAllYeasts,
  getYeastByBrand,
  getYeastByName,
  createYeast,
  updateYeast,
  deleteYeast,
} from "../db";
import { requireAdmin } from "./utils";

yeastsRouter.get("/", async (req, res) => {
  try {
    const yeasts = await getAllYeasts();
    res.send(yeasts);
  } catch (err) {
    res.send(err);
  }
});
yeastsRouter.post("/", requireAdmin, async (req, res) => {
  try {
    const { body } = req;
    const newYeast = await createYeast(body);
    res.send(newYeast);
  } catch (err) {
    res.send(err);
  }
});
yeastsRouter.get("/brand/:brandName", async (req, res) => {
  try {
    const { brandName } = req.params;
    const yeast = await getYeastByBrand(brandName);
    res.send(yeast);
  } catch (err) {
    res.send(err);
  }
});
yeastsRouter.get("/:yeastName", async (req, res) => {
  try {
    const { yeastName } = req.params;
    const yeast = await getYeastByName(yeastName);
    res.send(yeast);
  } catch (err) {
    res.send(err);
  }
});
yeastsRouter.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { body: fields } = req;
    const updatedYeast = await updateYeast(id, fields);
    res.send(updatedYeast);
  } catch (err) {
    res.send(err);
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
  } catch (err) {
    res.send(err);
  }
});

export default yeastsRouter;
