"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usersRouter = express_1.default.Router();
const bcrypt_1 = __importDefault(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const { ACCESS_TOKEN_SECRET = "", REFRESH_TOKEN_SECRET = "", MOBILE_REDIRECT_URL, } = process.env;
const index_1 = require("../db/index");
const utils_1 = require("./utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function getUserData(access_token) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    const data = await response.json();
    return data;
}
usersRouter.get("/oauth", async (req, res) => {
    let { code } = req.query;
    let userResponse;
    try {
        const redirectUrl = "https://mead-tools-api.vercel.app/api/users/oauth";
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUrl);
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        const user = oAuth2Client.credentials;
        let userData = null;
        if (user.access_token)
            userData = await getUserData(user.access_token);
        const userExists = (await (0, index_1.getUserByEmail)(userData?.email)) ||
            (await (0, index_1.getUserByGoogleId)(userData?.sub));
        if (userExists) {
            let accessToken, refreshToken;
            if (process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET) {
                accessToken = jsonwebtoken_1.default.sign({ id: userExists.id }, ACCESS_TOKEN_SECRET, {
                    expiresIn: "1w",
                });
                refreshToken = jsonwebtoken_1.default.sign({ id: userExists.id }, REFRESH_TOKEN_SECRET, {
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
        }
        else {
            const email = userData.email;
            const googleId = userData.sub || null;
            const newUser = await (0, index_1.createUser)({
                email,
                googleId,
            });
            let accessToken, refreshToken;
            if (newUser.id &&
                process.env.ACCESS_TOKEN_SECRET &&
                process.env.REFRESH_TOKEN_SECRET) {
                accessToken = jsonwebtoken_1.default.sign({ id: newUser.id }, ACCESS_TOKEN_SECRET, {
                    expiresIn: "1w",
                });
                refreshToken = jsonwebtoken_1.default.sign({ id: newUser.id }, REFRESH_TOKEN_SECRET, {
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
    }
    catch ({ name, message }) {
        res.send(message);
    }
    res.redirect(303, `${process.env.base_url}/login/?token=${userResponse?.accessToken}`);
});
usersRouter.get("/oauth/mobile", async (req, res) => {
    let { code } = req.query;
    let userResponse;
    try {
        const redirectUrl = "https://mead-tools-api.vercel.app/api/users/oauth/mobile";
        const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUrl);
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        const user = oAuth2Client.credentials;
        let userData = null;
        if (user.access_token)
            userData = await getUserData(user.access_token);
        const userExists = (await (0, index_1.getUserByEmail)(userData?.email)) ||
            (await (0, index_1.getUserByGoogleId)(userData?.sub));
        if (userExists) {
            let accessToken, refreshToken;
            if (process.env.ACCESS_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET) {
                accessToken = jsonwebtoken_1.default.sign({ id: userExists.id }, ACCESS_TOKEN_SECRET, {
                    expiresIn: "1w",
                });
                refreshToken = jsonwebtoken_1.default.sign({ id: userExists.id }, REFRESH_TOKEN_SECRET, {
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
        }
        else {
            const email = userData.email;
            const googleId = userData.sub || null;
            const newUser = await (0, index_1.createUser)({
                email,
                googleId,
            });
            let accessToken, refreshToken;
            if (newUser.id &&
                process.env.ACCESS_TOKEN_SECRET &&
                process.env.REFRESH_TOKEN_SECRET) {
                accessToken = jsonwebtoken_1.default.sign({ id: newUser.id }, ACCESS_TOKEN_SECRET, {
                    expiresIn: "1w",
                });
                refreshToken = jsonwebtoken_1.default.sign({ id: newUser.id }, REFRESH_TOKEN_SECRET, {
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
    }
    catch ({ name, message }) {
        res.send(message);
    }
    res.redirect(301, `${MOBILE_REDIRECT_URL}/?token=${userResponse?.accessToken}&refreshToken=${userResponse?.refreshToken}&email=${userResponse?.email}`);
});
usersRouter.get("/", utils_1.requireAdmin, async (req, res) => {
    try {
        const users = await (0, index_1.getAllUsers)();
        res.send({ users: users });
    }
    catch ({ name, message }) {
        res.send(message);
    }
});
usersRouter.post("/register", async (req, res, next) => {
    const { email, password: unhashed } = req.body;
    try {
        const user = await (0, index_1.getUserByEmail)(email);
        if (user) {
            next({
                name: "UserExistsError",
                message: "A user by that username already exists",
            });
        }
        const password = await bcrypt_1.default.hash(unhashed, 10);
        const newUser = await (0, index_1.createUser)({
            email,
            password,
        });
        let accessToken, refreshToken;
        if (process.env.JWT_SECRET) {
            accessToken = jsonwebtoken_1.default.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
                expiresIn: "1w",
            });
            refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
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
    }
    catch ({ name, message }) {
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
        const user = await (0, index_1.getUserByEmail)(email);
        let auth;
        if (user) {
            auth = await bcrypt_1.default.compare(password, user.password);
        }
        if (user && auth) {
            const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
                expiresIn: "1w",
            });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
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
        }
        else {
            next({
                name: "InvalidCredentialsError",
                message: "Invalid email or password",
            });
        }
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
usersRouter.post("/refresh", async (req, res, next) => {
    const { email, refreshToken } = req.body;
    const user = await (0, index_1.getUserByEmail)(email);
    const isValid = (0, utils_1.verifyRefresh)(user.id, refreshToken);
    try {
        if (!isValid) {
            next({ name: "InvalidTokenError", message: "Invalid refresh token" });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, ACCESS_TOKEN_SECRET, {
            expiresIn: "1w",
        });
        res.send({ success: true, accessToken });
    }
    catch ({ name, message }) {
        next({ name, message });
    }
});
usersRouter.get("/accountInfo", utils_1.requireUser, async (req, res, next) => {
    const { id } = req.user || { id: null };
    const me = await (0, index_1.getUser)(id);
    try {
        delete me.password;
        const recipes = await (0, index_1.getAllRecipesForUser)(id);
        res.send({ ...me, recipes });
    }
    catch ({ name, message }) {
        next({ name, message });
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
    catch ({ name, message }) {
        next({ name, message });
    }
});
exports.default = usersRouter;
