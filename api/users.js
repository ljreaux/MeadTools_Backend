const express = require("express");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");

const {
  getAllUsers,
  createUser,
  getUserByUsername,
  getUser,
  getAllRecipesForUser,
  updateUser,
  getUserByEmail,
  getUserByGoogleId
} = require("../db");
const { requireUser } = require("./utils");

const jwt = require("jsonwebtoken");

async function getUserData(access_token) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );
  const data = await response.json();
  return data;
}

usersRouter.get("/oauth", async (req, res, next) => {
  const { code } = req.query;
  let userResponse;

  try {
    const redirectUrl = "http://localhost:3000/api/users/oauth";

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl
    );
    const res = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(res.tokens);
    const user = oAuth2Client.credentials;
    const userData = await getUserData(user.access_token);

    const userExists = await getUserByEmail(userData.email) || await getUserByGoogleId(userData.sub);
    if (userExists) {
      const token = jwt.sign({ id: userExists.id }, process.env.JWT_SECRET, {
        expiresIn: "1w",
      });
      const { role } = userExists;
      userResponse = {
        message: "Successfully logged in!",
        token,
        role,
        email: userData.email,
      };
    } else {
      const newUser = await createUser({
        firstName: userData.given_name,
        lastName: userData.family_name,
        email: userData.email,
        googleId: userData.sub,
      });

      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: "1w",
      });
      userResponse = {
        message: "Thank you for signing up!",
        token,
        role: newUser.role,
        email: newUser.email,
      };
    }
  } catch ({ name, message }) {
    next(name, message);
  }
  res.redirect(303, `http://localhost:5173/login/?token=${userResponse.token}`);
});

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

    res.send({ ...me, recipes });
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
