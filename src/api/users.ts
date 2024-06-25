import express from "express";
const usersRouter = express.Router();
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { UserAuthInfoRequest } from ".";
const { ACCESS_TOKEN_SECRET = "", REFRESH_TOKEN_SECRET = "" } = process.env;

interface RequestWithCode extends Request {
  query: {
    code: string;
  };
}

import {
  getAllUsers,
  createUser,
  getUser,
  getAllRecipesForUser,
  updateUser,
  getUserByEmail,
  getUserByGoogleId,
} from "../db/index";
import { requireUser, requireAdmin, verifyRefresh } from "./utils";

import jwt from "jsonwebtoken";
import { access } from "fs";

async function getUserData(access_token: string) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );
  const data = await response.json();
  return data;
}

usersRouter.get("/oauth", async (req, res) => {
  let { code } = req.query as RequestWithCode["query"];
  let userResponse;

  try {
    const redirectUrl = "https://mead-tools-api.vercel.app/api/users/oauth";

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl
    );
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const user = oAuth2Client.credentials;
    let userData = null;
    if (user.access_token) userData = await getUserData(user.access_token);

    const userExists =
      (await getUserByEmail(userData?.email)) ||
      (await getUserByGoogleId(userData?.sub));

    if (userExists) {
      let accessToken, refreshToken;
      if (process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET) {
        accessToken = jwt.sign({ id: userExists.id }, ACCESS_TOKEN_SECRET, {
          expiresIn: "1w",
        });
        refreshToken = jwt.sign({ id: userExists.id }, REFRESH_TOKEN_SECRET, {
          expiresIn: "2w",
        });
      }

      const { role } = userExists;
      userResponse = {
        message: "Successfully logged in!",
        accessToken,
        refreshToken,
        role,
        email: userData.email,
      };
    } else {
      const email = userData.email as string;
      const googleId = (userData.sub as string) || null;
      const newUser = await createUser({
        email,
        googleId,
      });

      let accessToken, refreshToken;
      if (
        newUser.id &&
        process.env.ACCESS_TOKEN_SECRET &&
        process.env.REFRESH_TOKEN_SECRET
      ) {
        accessToken = jwt.sign({ id: newUser.id }, ACCESS_TOKEN_SECRET, {
          expiresIn: "1w",
        });
        refreshToken = jwt.sign({ id: newUser.id }, REFRESH_TOKEN_SECRET, {
          expiresIn: "2w",
        });
      }
      userResponse = {
        message: "Thank you for signing up!",
        accessToken,
        refreshToken,
        role: newUser.role,
        email: newUser.email,
      };
    }
  } catch ({ name, message }) {
    res.send(message);
  }
  res.redirect(
    303,
    `${process.env.base_url}/login/?token=${userResponse?.accessToken}`
  );
});
usersRouter.get("/oauth/mobile", async (req, res) => {
  let { code } = req.query as RequestWithCode["query"];
  let userResponse;

  try {
    const redirectUrl =
      "https://mead-tools-api.vercel.app/api/users/oauth/mobile";

    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl
    );
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const user = oAuth2Client.credentials;
    let userData = null;
    if (user.access_token) userData = await getUserData(user.access_token);

    const userExists =
      (await getUserByEmail(userData?.email)) ||
      (await getUserByGoogleId(userData?.sub));

    if (userExists) {
      let accessToken, refreshToken;
      if (process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET) {
        accessToken = jwt.sign({ id: userExists.id }, ACCESS_TOKEN_SECRET, {
          expiresIn: "1w",
        });
        refreshToken = jwt.sign({ id: userExists.id }, REFRESH_TOKEN_SECRET, {
          expiresIn: "2w",
        });
      }

      const { role } = userExists;
      userResponse = {
        message: "Successfully logged in!",
        accessToken,
        refreshToken,
        role,
        email: userData.email,
      };
    } else {
      const email = userData.email as string;
      const googleId = (userData.sub as string) || null;
      const newUser = await createUser({
        email,
        googleId,
      });

      let accessToken, refreshToken;
      if (
        newUser.id &&
        process.env.ACCESS_TOKEN_SECRET &&
        process.env.REFRESH_TOKEN_SECRET
      ) {
        accessToken = jwt.sign({ id: newUser.id }, ACCESS_TOKEN_SECRET, {
          expiresIn: "1w",
        });
        refreshToken = jwt.sign({ id: newUser.id }, REFRESH_TOKEN_SECRET, {
          expiresIn: "2w",
        });
      }
      userResponse = {
        message: "Thank you for signing up!",
        accessToken,
        refreshToken,
        role: newUser.role,
        email: newUser.email,
      };
    }
  } catch ({ name, message }) {
    res.send(message);
  }
  res.redirect(
    301,
    `exp://192.168.1.213:8081/login/?token=${userResponse?.accessToken}&refreshToken=${userResponse?.refreshToken}&email=${userResponse?.email}`
  );
});

usersRouter.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();

    res.send({ users: users });
  } catch ({ name, message }) {
    res.send(message);
  }
});
usersRouter.post("/register", async (req, res, next) => {
  const { email, password: unhashed } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const password = await bcrypt.hash(unhashed, 10);
    const newUser = await createUser({
      email,
      password,
    });

    let accessToken, refreshToken;
    if (process.env.JWT_SECRET) {
      accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: "1w",
      });
      refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: "2w",
      });
    }

    const { role } = newUser;

    res.send({
      message: "Thank you for signing up!",
      accessToken,
      refreshToken,
      role,
      email,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please provide email and password",
    });
  }
  try {
    const user = await getUserByEmail(email);
    let auth;
    if (user) {
      auth = await bcrypt.compare(password, user.password);
    }
    if (user && auth) {
      const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
        expiresIn: "1w",
      });
      const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: "2w",
      });
      const { role } = user;
      res.send({
        message: "Successfully logged in!",
        accessToken,
        refreshToken,
        role,
        email,
      });
    } else {
      next({
        name: "InvalidCredentialsError",
        message: "Invalid email or password",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/refresh", async (req, res, next) => {
  const { email, refreshToken } = req.body;
  const user = await getUserByEmail(email);
  const isValid = verifyRefresh(user.id, refreshToken);
  try {
    if (!isValid) {
      next({ name: "InvalidTokenError", message: "Invalid refresh token" });
    }
    const accessToken = jwt.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1w",
    });
    res.send({ success: true, accessToken });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.get(
  "/accountInfo",
  requireUser,
  async (req: UserAuthInfoRequest, res, next) => {
    const { id } = req.user || { id: null };
    const me = await getUser(id);
    try {
      delete me.password;
      const recipes = await getAllRecipesForUser(id);

      res.send({ ...me, recipes });
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

usersRouter.patch(
  "/accountInfo",
  requireUser,
  async (req: UserAuthInfoRequest, res, next) => {
    const { id } = req.user || { id: null };
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
  }
);

export default usersRouter;
