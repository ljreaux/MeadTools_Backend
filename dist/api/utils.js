"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefresh = exports.checkAdmin = exports.requireAdmin = exports.requireUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const { REFRESH_TOKEN_SECRET = "" } = process.env;
function requireUser(req, res, next) {
    if (!req.user) {
        res.status(401);
        next({
            name: "MissingUserError",
            message: "You must be logged in to perform this action",
        });
    }
    next();
}
exports.requireUser = requireUser;
function requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
        res.status(401);
        next({
            name: "MissingAdminError",
            message: "You must be an admin to perform this action",
        });
    }
    next();
}
exports.requireAdmin = requireAdmin;
function checkAdmin(user = { role: "user" }) {
    if (user.role !== "admin") {
        return false;
    }
    return true;
}
exports.checkAdmin = checkAdmin;
function verifyRefresh(id, token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
        return decoded.id === id;
    }
    catch (error) {
        // console.error(error);
        return false;
    }
}
exports.verifyRefresh = verifyRefresh;
