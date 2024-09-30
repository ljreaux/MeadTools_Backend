import express, { Request } from "express";
const apiRouter = express.Router();
import path from "path";

import jwt from "jsonwebtoken";
import { getUser } from "../db/index";
const { ACCESS_TOKEN_SECRET = "", REFRESH_TOKEN_SECRET = "" } = process.env;

apiRouter.use(express.static(path.join(__dirname, "docs")));

interface JwtPayload {
  id: string;
}

export interface UserAuthInfoRequest extends Request {
  user?: { id: string; email: string; role: "user" | "admin" };
}

apiRouter.use(async (req: UserAuthInfoRequest, res, next) => {
  const auth = req.header("Authorization");
  const token = auth?.split(" ")[1];
  if (!auth || !token || !ACCESS_TOKEN_SECRET) next();
  else {
    try {
      const { id } = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
      if (id) {
        const { email, role } = await getUser(id);
        req.user = { id, email, role };
        next();
      } else
        next({
          name: "AuthorizationHeaderError",
          message: "Authorization token malformed",
        });
    } catch (err) {
      next(err);
    }
  }
});

apiRouter.use((req: UserAuthInfoRequest, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});

import usersRouter from "./users";
apiRouter.use("/users", usersRouter);

import requestRouter from "./request";
apiRouter.use("/request", requestRouter);

import recipesRouter from "./recipes";
apiRouter.use("/recipes", recipesRouter);

import ingredientsRouter from "./ingredients";
apiRouter.use("/ingredients", ingredientsRouter);

import yeastsRouter from "./yeasts";
apiRouter.use("/yeasts", yeastsRouter);

import iSpindelRouter from "./iSpindel";
apiRouter.use("/iSpindel", iSpindelRouter);

export default apiRouter;
