"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersRouter = express_1.default.Router();
const bcrypt_1 = __importDefault(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const index_1 = require("../db/index");
const utils_1 = require("./utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function getUserData(access_token) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    const data = await response.json();
    return data;
}
usersRouter.get("/oauth", async (req, res, next) => {
    let { code } = req.query;
    let userResponse;
    try {
        const redirectUrl = "http://localhost:3000/api/users/oauth";
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUrl);
        oAuth2Client
            .getToken(code)
            .then((res) => oAuth2Client.setCredentials(res.tokens));
        const user = oAuth2Client.credentials;
        let userData = null;
        if (user.access_token)
            userData = await getUserData(user.access_token);
        const userExists = (await (0, index_1.getUserByEmail)(userData.email)) ||
            (await (0, index_1.getUserByGoogleId)(userData.sub));
        if (userExists) {
            let token;
            if (process.env.JWT_SECRET)
                token = jsonwebtoken_1.default.sign({ id: userExists.id }, process.env.JWT_SECRET, {
                    expiresIn: "1w",
                });
            const { role } = userExists;
            userResponse = {
                message: "Successfully logged in!",
                token,
                role,
                email: userData.email,
            };
        }
        else {
            const firstName = userData.given_name;
            const lastName = userData.family_name;
            const email = userData.email;
            const googleId = userData.sub || null;
            const newUser = await (0, index_1.createUser)({
                firstName,
                lastName,
                email,
                googleId,
            });
            let token;
            if (newUser.id && process.env.JWT_SECRET)
                token = jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.JWT_SECRET, {
                    expiresIn: "1w",
                });
            userResponse = {
                message: "Thank you for signing up!",
                token,
                role: newUser.role,
                email: newUser.email,
            };
        }
    }
    catch (err) {
        next(err);
    }
    res.redirect(303, `http://localhost:5173/login/?token=${userResponse?.token}`);
});
usersRouter.get("/", async (req, res, next) => {
    try {
        const users = await (0, index_1.getAllUsers)();
        res.send({ users: users });
    }
    catch (err) {
        next(err);
    }
});
usersRouter.post("/register", async (req, res, next) => {
    const { username, firstName, lastName, email, password: unhashed } = req.body;
    try {
        const user = await (0, index_1.getUserByUsername)(username);
        if (user) {
            next({
                name: "UserExistsError",
                message: "A user by that username already exists",
            });
        }
        const password = await bcrypt_1.default.hash(unhashed, 10);
        const newUser = await (0, index_1.createUser)({
            username,
            firstName,
            lastName,
            email,
            password,
        });
        let token;
        if (process.env.JWT_SECRET)
            token = jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.JWT_SECRET, {
                expiresIn: "1w",
            });
        const { role } = newUser;
        res.send({
            message: "Thank you for signing up!",
            token,
            role,
            username,
        });
    }
    catch (err) {
        next(err);
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
        const user = await (0, index_1.getUserByUsername)(username);
        let auth;
        if (user) {
            auth = await bcrypt_1.default.compare(password, user.password);
        }
        if (user && auth) {
            let token;
            if (process.env.JWT_SECRET)
                token = jsonwebtoken_1.default.sign({ id: user.id, username }, process.env.JWT_SECRET, {
                    expiresIn: "1w",
                });
            const { role } = user;
            res.send({
                message: "Successfully logged in!",
                token,
                role,
                username,
            });
        }
        else {
            next({
                name: "InvalidCredentialsError",
                message: "Invalid username or password",
            });
        }
    }
    catch (err) {
        next(err);
    }
});
usersRouter.get("/accountInfo", utils_1.requireUser, async (req, res, next) => {
    const { id } = req.user || { id: null };
    try {
        const me = await (0, index_1.getUser)(id);
        delete me.password;
        const recipes = await (0, index_1.getAllRecipesForUser)(id);
        res.send({ ...me, recipes });
    }
    catch (err) {
        next(err);
    }
});
usersRouter.patch("/accountInfo", utils_1.requireUser, async (req, res, next) => {
    const { id } = req.user || { id: null };
    const { password: hashed } = req.body;
    try {
        if (hashed) {
            const password = await bcrypt_1.default.hash(hashed, 10);
            req.body.password = password;
        }
        const updatedUser = await (0, index_1.updateUser)(id, { ...req.body });
        res.send({ updatedUser });
    }
    catch (err) {
        next(err);
    }
});
exports.default = usersRouter;
