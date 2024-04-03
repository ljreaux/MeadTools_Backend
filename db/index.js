const { Client } = require("pg");

const client = new Client({
  connectionString:
    process.env.DATABASE_URL || "postgres://localhost:5432/meadtools-dev",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

async function createUser({
  firstName = "",
  lastName = "",
  username = "",
  email,
  password = "",
  role = "user",
  googleId = "",
}) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    INSERT INTO users (first_name, last_name, username, email, password, role, google_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (email) DO NOTHING
    RETURNING *;
    `,
      [firstName, lastName, username, email, password, role, googleId]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    delete user.password;

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  try {
    const { rows: users } = await client.query(`
      SELECT id, first_name, last_name, username, email, role
      FROM users;
    `);

    return users;
  } catch (error) {
    throw error;
  }
}

async function getUser(id) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT * FROM users WHERE id=$1;
    `,
      [id]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1
    `,
      [username]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE email=$1
    `,
      [email]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

async function deleteUser(id) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      DELETE FROM users WHERE id=$1;
    `,
      [id]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllRecipes() {
  try {
    const { rows: recipes } = await client.query(`
      SELECT * FROM recipes;
    `);
    return recipes;
  } catch (error) {
    throw error;
  }
}

async function getAllRecipesForUser(id) {
  try {
    const { rows: recipes } = await client.query(`
      SELECT * FROM recipes WHERE user_id=${id};
    `);
    return recipes;
  } catch (error) {
    throw error;
  }
}

async function getRecipeInfo(recipeId) {
  try {
    const {
      rows: [recipe],
    } = await client.query(
      `
      SELECT * FROM recipes WHERE id=$1;
    `,
      [recipeId]
    );
    if (!recipe)
      return { name: "RecipeNotFoundError", message: "Recipe not found" };
    return recipe;
  } catch (error) {
    throw error;
  }
}

async function createRecipe({
  userId,
  name,
  ingredients,
  units,
  volUnits,
  rowCount,
  submitted,
  yeastInfo,
  yeastBrand,
  nuteSchedule,
  numOfAdditions,
  extraIngredients,
}) {
  try {
    const {
      rows: [recipe],
    } = await client.query(
      `
      INSERT INTO recipes (user_id, name, ingredients, units, vol_units, row_count, submitted, yeast_info, yeast_brand, nute_schedule, num_of_additions, extra_ingredients)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `,
      [
        userId,
        name,
        ingredients,
        units,
        volUnits,
        rowCount,
        submitted,
        yeastInfo,
        yeastBrand,
        nuteSchedule,
        numOfAdditions,
        extraIngredients,
      ]
    );
    return recipe;
  } catch (error) {
    throw error;
  }
}

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
    const {
      rows: [recipe],
    } = await client.query(
      `
      UPDATE recipes
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return recipe;
  } catch (error) {
    throw error;
  }
}

async function createIngredient({
  name,
  sugarContent,
  waterContent,
  category,
}) {
  try {
    const {
      rows: [ingredient],
    } = await client.query(
      `
      INSERT INTO ingredients (name, sugar_content, water_content, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
      [name, sugarContent, waterContent, category]
    );
    return ingredient;
  } catch (error) {
    throw error;
  }
}

async function deleteRecipe(id) {
  try {
    const {
      rows: [recipe],
    } = await client.query(
      `
      DELETE FROM recipes
      WHERE id=$1
      RETURNING *;
    `,
      [id]
    );
    return recipe;
  } catch (error) {
    throw error;
  }
}

async function updateIngredient(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  );
  try {
    const {
      rows: [ingredient],
    } = await client.query(
      `
    UPDATE ingredients
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
  `,
      Object.values(fields)
    );

    return ingredient;
  } catch (error) {
    throw error;
  }
}

async function getAllIngredients() {
  try {
    const { rows: ingredients } = await client.query(`
      SELECT * FROM ingredients;
    `);
    return ingredients;
  } catch (error) {
    throw error;
  }
}

async function getIngredient(id) {
  try {
    const {
      rows: [ingredient],
    } = await client.query(`
      SELECT * FROM ingredients WHERE id=${id};
    `);
    if (!ingredient)
      throw {
        name: "IngredientNotFoundError",
        message: "Ingredient not found",
      };
    return ingredient;
  } catch (error) {
    throw error;
  }
}

async function getIngredientsByCategory(cat) {
  console.log(typeof cat);
  try {
    const { rows: ingredients } = await client.query(
      `
     SELECT * FROM ingredients
      WHERE category=$1;
    `,
      [cat]
    );
    if (!ingredients)
      throw {
        name: "IngredientsNotFoundError",
        message: "Ingredients not found",
      };
    return ingredients;
  } catch (error) {
    throw error;
  }
}

async function getIngredientByName(name) {
  try {
    const {
      rows: [ingredient],
    } = await client.query(
      `
      SELECT * FROM ingredients WHERE name=$1;
    `,
      [name]
    );
    if (!ingredient)
      throw {
        name: "IngredientNotFoundError",
        message: "Ingredient not found",
      };
    return ingredient;
  } catch (error) {
    throw error;
  }
}

async function deleteIngredient(id) {
  try {
    const {
      rows: [ingredient],
    } = await client.query(
      `
      DELETE FROM ingredients
      WHERE id=$1
      RETURNING *;
    `,
      [id]
    );
    return ingredient;
  } catch (error) {
    throw error;
  }
}

async function createYeast({
  brand,
  name,
  nitrogenRequirement,
  tolerance,
  lowTemp,
  highTemp,
}) {
  try {
    const {
      rows: [yeast],
    } = await client.query(
      `
      INSERT INTO yeasts (brand, name, nitrogen_requirement, tolerance, low_temp, high_temp)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
      [brand, name, nitrogenRequirement, tolerance, lowTemp, highTemp]
    );
    return yeast;
  } catch (error) {
    throw error;
  }
}

async function updateYeast(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  );
  try {
    const {
      rows: [yeast],
    } = await client.query(
      `
    UPDATE yeasts
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
  `,
      Object.values(fields)
    );

    return yeast;
  } catch (error) {
    throw error;
  }
}

async function getAllYeasts() {
  try {
    const { rows: yeasts } = await client.query(`
      SELECT * FROM yeasts;
    `);
    return yeasts;
  } catch (error) {
    throw error;
  }
}

async function getYeastByName(name) {
  try {
    const {
      rows: [yeast],
    } = await client.query(
      `
      SELECT * FROM yeasts WHERE name=$1;
    `,
      [name]
    );
    if (!yeast)
      throw {
        name: "YeastNotFoundError",
        message: "Yeast not found",
      };
    return yeast;
  } catch (error) {
    throw error;
  }
}

async function getYeastByBrand(brand) {
  try {
    const { rows: yeasts } = await client.query(
      `
      SELECT * FROM yeasts WHERE brand=$1;
    `,
      [brand]
    );
    if (!yeasts)
      throw {
        name: "YeastsNotFoundError",
        message: "Yeasts not found",
      };
    return yeasts;
  } catch (error) {
    throw error;
  }
}

async function deleteYeast(id) {
  try {
    const {
      rows: [yeast],
    } = await client.query(
      `
      DELETE FROM yeasts
      WHERE id=$1
      RETURNING *;
    `,
      [id]
    );
    return yeast;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUser,
  getUserByUsername,
  getUserByEmail,
  deleteUser,
  getAllRecipes,
  getAllRecipesForUser,
  getRecipeInfo,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  createIngredient,
  updateIngredient,
  getAllIngredients,
  getIngredient,
  getIngredientsByCategory,
  getIngredientByName,
  deleteIngredient,
  createYeast,
  updateYeast,
  getAllYeasts,
  getYeastByName,
  getYeastByBrand,
  deleteYeast,
};
