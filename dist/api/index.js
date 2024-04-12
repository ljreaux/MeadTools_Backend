"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiRouter = express_1.default.Router();
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../db/index");
const { JWT_SECRET } = process.env;
apiRouter.use(express_1.default.static(path_1.default.join(__dirname, "documentation")));
apiRouter.use(async (req, res, next) => {
    const auth = req.header("Authorization");
    const token = auth?.split(" ")[1];
    if (!auth || !token || !JWT_SECRET)
        next();
    else {
        try {
            const { id } = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (id) {
                const { email, role } = await (0, index_1.getUser)(id);
                req.user = { id, email, role };
                next();
            }
            else
                next({
                    name: "AuthorizationHeaderError",
                    message: "Authorization token malformed",
                });
        }
        catch (err) {
            next(err);
        }
    }
});
apiRouter.use((req, res, next) => {
    if (req.user) {
        console.log("User is set:", req.user);
    }
    next();
});
const users_1 = __importDefault(require("./users"));
apiRouter.use("/users", users_1.default);
const request_1 = __importDefault(require("./request"));
apiRouter.use("/request", request_1.default);
const recipes_1 = __importDefault(require("./recipes"));
apiRouter.use("/recipes", recipes_1.default);
const ingredients_1 = __importDefault(require("./ingredients"));
apiRouter.use("/ingredients", ingredients_1.default);
const yeasts_1 = __importDefault(require("./yeasts"));
apiRouter.use("/yeasts", yeasts_1.default);
exports.default = apiRouter;
