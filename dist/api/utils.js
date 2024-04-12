"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.requireAdmin = exports.requireUser = void 0;
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
