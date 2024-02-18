const express = require("express");
const apiRouter = express.Router();
const path = require("path");

const jwt = require("jsonwebtoken");

apiRouter.use(express.static(path.join(__dirname, "documentation")));

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const ingredientsRouter = require("./ingredients");
apiRouter.use("/ingredients", ingredientsRouter);

const yeastsRouter = require("./yeasts");
apiRouter.use("/yeasts", yeastsRouter);

module.exports = apiRouter;
