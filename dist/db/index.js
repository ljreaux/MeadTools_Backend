"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHydrometerToken = exports.createHydrometerToken = exports.deleteYeast = exports.getYeastByBrand = exports.getYeastById = exports.getYeastByName = exports.getAllYeasts = exports.updateYeast = exports.createYeast = exports.deleteIngredient = exports.getIngredientByName = exports.getIngredientsByCategory = exports.getIngredient = exports.getAllIngredients = exports.updateIngredient = exports.deleteRecipe = exports.createIngredient = exports.updateRecipe = exports.createRecipe = exports.getRecipeInfo = exports.getAllRecipesForUser = exports.getAllRecipes = exports.deleteUser = exports.getUserByGoogleId = exports.getUserByEmail = exports.getUser = exports.getAllUsers = exports.updateUser = exports.createUser = exports.client = void 0;
const pg_1 = require("pg");
const short_unique_id_1 = __importDefault(require("short-unique-id"));
exports.client = new pg_1.Client({
    connectionString: process.env.DATABASE_URL || process.env.DEV_DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
});
async function createUser({ email, password = "", role = "user", googleId = "", }) {
    try {
        const { rows: [user], } = await exports.client.query(`
    INSERT INTO users (email, password, role, google_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO NOTHING
    RETURNING *;
    `, [email, password, role, googleId]);
        return user;
    }
    catch (error) {
        throw error;
    }
}
exports.createUser = createUser;
async function updateUser(id, fields = {}) {
    if (!id)
        throw new Error("No User Error");
    // build the set string
    const setString = Object.keys(fields)
        .map((key, index) => `"${key}"=$${index + 1}`)
        .join(", ");
    // return early if this is called without fields
    if (setString.length === 0) {
        return;
    }
    try {
        const { rows: [user], } = await exports.client.query(`
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `, Object.values(fields));
        delete user.password;
        return user;
    }
    catch (error) {
        throw error;
    }
}
exports.updateUser = updateUser;
async function getAllUsers() {
    try {
        const { rows: users } = await exports.client.query(`
      SELECT id, email, role
      FROM users;
    `);
        return users;
    }
    catch (error) {
        throw error;
    }
}
exports.getAllUsers = getAllUsers;
async function getUser(id) {
    if (!id)
        throw new Error("No User Error");
    try {
        const { rows: [user], } = await exports.client.query(`
      SELECT * FROM users WHERE id=$1;
    `, [id]);
        return user;
    }
    catch (error) {
        throw error;
    }
}
exports.getUser = getUser;
async function getUserByEmail(email) {
    try {
        const { rows: [user], } = await exports.client.query(`
      SELECT *
      FROM users
      WHERE email=$1
    `, [email]);
        return user;
    }
    catch (error) {
        throw error;
    }
}
exports.getUserByEmail = getUserByEmail;
async function getUserByGoogleId(googleId) {
    try {
        const { rows: [user], } = await exports.client.query(`
      SELECT *
      FROM users
      WHERE google_id=$1
    `, [googleId]);
        return user;
    }
    catch (error) {
        throw error;
    }
}
exports.getUserByGoogleId = getUserByGoogleId;
async function deleteUser(id) {
    try {
        const { rows: [user], } = await exports.client.query(`
      DELETE FROM users WHERE id=$1;
    `, [id]);
        return user;
    }
    catch (error) {
        throw error;
    }
}
exports.deleteUser = deleteUser;
async function getAllRecipes() {
    try {
        const { rows: recipes } = await exports.client.query(`
      SELECT * FROM recipes;
    `);
        return recipes;
    }
    catch (error) {
        throw error;
    }
}
exports.getAllRecipes = getAllRecipes;
async function getAllRecipesForUser(id) {
    if (!id)
        throw new Error("No User Error");
    try {
        const { rows: recipes } = await exports.client.query(`
      SELECT * FROM recipes WHERE user_id=${id};
    `);
        return recipes;
    }
    catch (error) {
        throw error;
    }
}
exports.getAllRecipesForUser = getAllRecipesForUser;
async function getRecipeInfo(recipeId) {
    try {
        const { rows: [recipe], } = await exports.client.query(`
      SELECT * FROM recipes WHERE id=$1;
    `, [recipeId]);
        if (!recipe)
            return { name: "RecipeNotFoundError", message: "Recipe not found" };
        return recipe;
    }
    catch (error) {
        throw error;
    }
}
exports.getRecipeInfo = getRecipeInfo;
async function createRecipe({ userId, name, recipeData, yanFromSource, yanContribution, nutrientData, advanced, nuteInfo, primaryNotes = ["", ""], secondaryNotes = ["", ""], privateRecipe = false }) {
    try {
        const { rows: [recipe], } = await exports.client.query(`
      INSERT INTO recipes (user_id,
        name,
        "recipeData",
        "yanFromSource",
        "yanContribution",
        "nutrientData",
        advanced,
        "nuteInfo",
       "primaryNotes",
        "secondaryNotes",
        private)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `, [
            userId,
            name,
            recipeData,
            yanFromSource,
            yanContribution,
            nutrientData,
            advanced,
            nuteInfo,
            primaryNotes,
            secondaryNotes,
            privateRecipe
        ]);
        return recipe;
    }
    catch (error) {
        throw error;
    }
}
exports.createRecipe = createRecipe;
async function updateRecipe(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields)
        .map((key, index) => `"${key}"=$${index + 1}`)
        .join(", ");
    // return early if this is called without fields
    if (setString.length === 0) {
        return;
    }
    try {
        const { rows: [recipe], } = await exports.client.query(`
      UPDATE recipes
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `, Object.values(fields));
        return recipe;
    }
    catch (error) {
        throw error;
    }
}
exports.updateRecipe = updateRecipe;
async function createIngredient({ name, sugarContent, waterContent, category, }) {
    try {
        const { rows: [ingredient], } = await exports.client.query(`
      INSERT INTO ingredients (name, sugar_content, water_content, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `, [name, sugarContent, waterContent, category]);
        return ingredient;
    }
    catch (error) {
        throw error;
    }
}
exports.createIngredient = createIngredient;
async function deleteRecipe(id) {
    try {
        const { rows: [recipe], } = await exports.client.query(`
      DELETE FROM recipes
      WHERE id=$1
      RETURNING *;
    `, [id]);
        return recipe;
    }
    catch (error) {
        throw error;
    }
}
exports.deleteRecipe = deleteRecipe;
async function updateIngredient(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`);
    try {
        const { rows: [ingredient], } = await exports.client.query(`
    UPDATE ingredients
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
  `, Object.values(fields));
        return ingredient;
    }
    catch (error) {
        throw error;
    }
}
exports.updateIngredient = updateIngredient;
async function getAllIngredients() {
    try {
        const { rows: ingredients } = await exports.client.query(`
      SELECT * FROM ingredients;
    `);
        return ingredients;
    }
    catch (error) {
        throw error;
    }
}
exports.getAllIngredients = getAllIngredients;
async function getIngredient(id) {
    try {
        const { rows: [ingredient], } = await exports.client.query(`
      SELECT * FROM ingredients WHERE id=${id};
    `);
        if (!ingredient)
            throw {
                name: "IngredientNotFoundError",
                message: "Ingredient not found",
            };
        return ingredient;
    }
    catch (error) {
        throw error;
    }
}
exports.getIngredient = getIngredient;
async function getIngredientsByCategory(cat) {
    console.log(typeof cat);
    try {
        const { rows: ingredients } = await exports.client.query(`
     SELECT * FROM ingredients
      WHERE category=$1;
    `, [cat]);
        if (!ingredients)
            throw {
                name: "IngredientsNotFoundError",
                message: "Ingredients not found",
            };
        return ingredients;
    }
    catch (error) {
        throw error;
    }
}
exports.getIngredientsByCategory = getIngredientsByCategory;
async function getIngredientByName(name) {
    try {
        const { rows: [ingredient], } = await exports.client.query(`
      SELECT * FROM ingredients WHERE name=$1;
    `, [name]);
        if (!ingredient)
            throw {
                name: "IngredientNotFoundError",
                message: "Ingredient not found",
            };
        return ingredient;
    }
    catch (error) {
        throw error;
    }
}
exports.getIngredientByName = getIngredientByName;
async function deleteIngredient(id) {
    try {
        const { rows: [ingredient], } = await exports.client.query(`
      DELETE FROM ingredients
      WHERE id=$1
      RETURNING *;
    `, [id]);
        return ingredient;
    }
    catch (error) {
        throw error;
    }
}
exports.deleteIngredient = deleteIngredient;
async function createYeast({ brand, name, nitrogenRequirement, tolerance, lowTemp, highTemp, }) {
    try {
        const { rows: [yeast], } = await exports.client.query(`
      INSERT INTO yeasts (brand, name, nitrogen_requirement, tolerance, low_temp, high_temp)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, [brand, name, nitrogenRequirement, tolerance, lowTemp, highTemp]);
        return yeast;
    }
    catch (error) {
        throw error;
    }
}
exports.createYeast = createYeast;
async function updateYeast(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map((key, index) => `"${key}"=$${index + 1}`);
    try {
        const { rows: [yeast], } = await exports.client.query(`
    UPDATE yeasts
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
  `, Object.values(fields));
        return yeast;
    }
    catch (error) {
        throw error;
    }
}
exports.updateYeast = updateYeast;
async function getAllYeasts() {
    try {
        const { rows: yeasts } = await exports.client.query(`
      SELECT * FROM yeasts;
    `);
        return yeasts;
    }
    catch (error) {
        throw error;
    }
}
exports.getAllYeasts = getAllYeasts;
async function getYeastByName(name) {
    try {
        const { rows: [yeast], } = await exports.client.query(`
      SELECT * FROM yeasts WHERE name=$1;
    `, [name]);
        if (!yeast)
            throw {
                name: "YeastNotFoundError",
                message: "Yeast not found",
            };
        return yeast;
    }
    catch (error) {
        throw error;
    }
}
exports.getYeastByName = getYeastByName;
async function getYeastById(id) {
    try {
        const { rows: [yeast], } = await exports.client.query(`
      SELECT * FROM yeasts WHERE id=$1;
    `, [id]);
        if (!yeast)
            throw {
                name: "YeastNotFoundError",
                message: "Yeast not found",
            };
        return yeast;
    }
    catch (error) {
        throw error;
    }
}
exports.getYeastById = getYeastById;
async function getYeastByBrand(brand) {
    try {
        const { rows: yeasts } = await exports.client.query(`
      SELECT * FROM yeasts WHERE brand=$1;
    `, [brand]);
        if (!yeasts)
            throw {
                name: "YeastsNotFoundError",
                message: "Yeasts not found",
            };
        return yeasts;
    }
    catch (error) {
        throw error;
    }
}
exports.getYeastByBrand = getYeastByBrand;
async function deleteYeast(id) {
    try {
        const { rows: [yeast], } = await exports.client.query(`
      DELETE FROM yeasts
      WHERE id=$1
      RETURNING *;
    `, [id]);
        return yeast;
    }
    catch (error) {
        throw error;
    }
}
exports.deleteYeast = deleteYeast;
async function createHydrometerToken(userId) {
    const { randomUUID } = new short_unique_id_1.default();
    const token = randomUUID(10);
    try {
        const { rows: [user] } = await exports.client.query(`
      UPDATE users
      SET hydro_token=$1
      WHERE id=$2
      RETURNING *;
      `, [token, userId]);
        return {
            userId: user.id,
            email: user.email,
            token: user.token,
        };
    }
    catch (error) {
        throw error;
    }
}
exports.createHydrometerToken = createHydrometerToken;
async function getHydrometerToken(userId) {
    try {
        const { rows: [user] } = await exports.client.query(`
    SELECT hydro_token
    FROM users
    WHERE id=$1;
    `, [userId]);
        if (!user) {
            throw {
                name: "UserNotFoundError",
                message: "User not found",
            };
        }
        console.log(user);
        return {
            token: user.hydro_token,
        };
    }
    catch (error) {
        throw error;
    }
}
exports.getHydrometerToken = getHydrometerToken;
