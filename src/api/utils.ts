import { Response, NextFunction } from "express";
import { UserAuthInfoRequest } from ".";

export function requireUser(
  req: UserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401);
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action",
    });
  }

  next();
}

export function requireAdmin(
  req: UserAuthInfoRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "admin") {
    res.status(401);
    next({
      name: "MissingAdminError",
      message: "You must be an admin to perform this action",
    });
  }
  next();
}

export function checkAdmin(
  user: { role: "user" | "admin" } = { role: "user" }
) {
  if (user.role !== "admin") {
    return false;
  }
  return true;
}
