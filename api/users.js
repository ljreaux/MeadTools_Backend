const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

usersRouter.get("/", async (req, res) => {
  res.send("testing get all users");
});
usersRouter.post("/register", async (req, res) => {
  res.send("testing register");
});

usersRouter.post("/login", async (req, res) => {
  res.send("testing login");
});

usersRouter.post("/addRecipe", async (req, res) => {
  res.send("testing add recipe");
});

usersRouter.get("/accountInfo", async (req, res) => {
  res.send("testing get account info");
});

usersRouter.patch("/accountInfo", async (req, res) => {
  res.send("testing patch account info");
});

usersRouter.get("/accountInfo/:recipeId", async (req, res) => {
  res.send("testing get recipe with the id: " + req.params.recipeId);
});

usersRouter.patch("/accountInfo/:recipeId", async (req, res) => {
  res.send("testing patch recipe with the id: " + req.params.recipeId);
});

usersRouter.delete("/accountInfo/:recipeId", async (req, res) => {
  res.send("testing delete recipe with the id: " + req.params.recipeId);
});

usersRouter.get("/accountInfo/:recipeId/pdf", async (req, res) => {
  res.send("testing get recipe pdf with the id: " + req.params.recipeId);
});

module.exports = usersRouter;
