const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");

const {
  getAllUsers,
  createUser,
  getUserByUsername,
  getUser,
  getAllRecipesForUser,
  updateUser,
} = require("../db");
const { requireUser } = require("./utils");

const jwt = require("jsonwebtoken");

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await getAllUsers();

    res.send({ users: users });
  } catch ({ name, message }) {
    next({ name, message });
  }
});
usersRouter.post("/register", async (req, res, next) => {
  const { username, firstName, lastName, email, password: unhashed } = req.body;

  try {
    const user = await getUserByUsername(username);
    if (user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const password = await bcrypt.hash(unhashed, 10);
    const newUser = await createUser({
      username,
      firstName,
      lastName,
      email,
      password,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1w",
    });

    const { role } = newUser;

    res.send({
      message: "Thank you for signing up!",
      token,
      role,
      username,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please provide username and password",
    });
  }
  try {
    const user = await getUserByUsername(username);
    let auth;
    if (user) {
      auth = await bcrypt.compare(password, user.password);
    }
    if (user && auth) {
      const token = jwt.sign(
        { id: user.id, username },
        process.env.JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );
      const { role } = user;
      res.send({
        message: "Successfully logged in!",
        token,
        role,
        username,
      });
    } else {
      next({
        name: "InvalidCredentialsError",
        message: "Invalid username or password",
      });
    }
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/accountInfo", requireUser, async (req, res, next) => {
  const { id } = req.user;
  try {
    const me = await getUser(id);
    delete me.password;
    const recipes = await getAllRecipesForUser(id);

    res.send({ me, recipes });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.patch("/accountInfo", requireUser, async (req, res) => {
  const { id } = req.user;
  const { password: hashed } = req.body;

  try {
    if (hashed) {
      const password = await bcrypt.hash(hashed, 10);
      req.body.password = password;
    }
    const updatedUser = await updateUser(id, { ...req.body });
    res.send({ updatedUser });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
