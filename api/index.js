const express = require("express");
const apiRouter = express.Router();
const path = require("path");

const jwt = require("jsonwebtoken");
const { getUser } = require("../db");
const { JWT_SECRET } = process.env;

apiRouter.use(express.static(path.join(__dirname, "documentation")));

apiRouter.use(async (req, res, next) => {
  const auth = req.header("Authorization");
  const token = auth?.split(" ")[1];
  if (!auth) next();
  else {
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        const { username, role } = await getUser(id);
        req.user = { id, username, role };
        next();
      } else
        next({
          name: "AuthorizationHeaderError",
          message: "Authorization token malformed",
        });
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});

const usersRouter = require("./users");
apiRouter.use("/users", usersRouter);

const recipesRouter = require("./recipes");
apiRouter.use("/recipes", recipesRouter);

const ingredientsRouter = require("./ingredients");
apiRouter.use("/ingredients", ingredientsRouter);

const yeastsRouter = require("./yeasts");
apiRouter.use("/yeasts", yeastsRouter);

module.exports = apiRouter;
