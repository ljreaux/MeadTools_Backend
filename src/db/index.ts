import { Client } from "pg";
import ShortUniqueId from "short-unique-id";
export const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DEV_DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export interface User {
  id?: string;
  email: string | null;
  password: string | undefined;
  role: "user" | "admin";
  googleId: string | null;
}

interface Recipe {
  userId: number;
  name: string;
  recipeData: string;
  yanFromSource: string | null;
  yanContribution: string | null;
  nutrientData: string;
  advanced: boolean;
  nuteInfo: string;
  primaryNotes?: string[];
  secondaryNotes?: string[];
  privateRecipe?: boolean;
}

interface Ingredient {
  name: string;
  sugarContent: number;
  waterContent: number;
  category: string;
}

export interface Yeast {
  brand: string;
  name: string;
  nitrogenRequirement: string;
  tolerance: number | string;
  lowTemp: number;
  highTemp: number;
}

export async function createUser({
  email,
  password = "",
  role = "user",
  googleId = "",
}: Partial<User>): Promise<Partial<User>> {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    INSERT INTO users (email, password, role, google_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO NOTHING
    RETURNING *;
    `,
      [email, password, role, googleId]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(id: string | null, fields = {}) {
  if (!id) throw new Error("No User Error");
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

export async function getAllUsers() {
  try {
    const { rows: users } = await client.query(`
      SELECT id, email, role
      FROM users;
    `);

    return users;
  } catch (error) {
    throw error;
  }
}

export async function getUser(id: string | null) {
  if (!id) throw new Error("No User Error");
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

export async function getUserByEmail(email: string) {
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

export async function getUserByGoogleId(googleId: number) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE google_id=$1
    `,
      [googleId]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(id: string) {
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

export async function getAllRecipes() {
  try {
    const { rows: recipes } = await client.query(`
      SELECT * FROM recipes;
    `);
    return recipes;
  } catch (error) {
    throw error;
  }
}

export async function getAllRecipesForUser(id: string | null) {
  if (!id) throw new Error("No User Error");
  try {
    const { rows: recipes } = await client.query(`
      SELECT * FROM recipes WHERE user_id=${id};
    `);
    return recipes;
  } catch (error) {
    throw error;
  }
}

export async function getRecipeInfo(recipeId: string) {
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

export async function createRecipe({
  userId,
  name,
  recipeData,
  yanFromSource,
  yanContribution,
  nutrientData,
  advanced,
  nuteInfo,
  primaryNotes = ["", ""],
  secondaryNotes = ["", ""],
  privateRecipe = false
}: Recipe) {
  try {
    const {
      rows: [recipe],
    } = await client.query(
      `
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
    `,
      [
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
      ]
    );
    return recipe;
  } catch (error) {
    throw error;
  }
}

export async function updateRecipe(id: string, fields = {}) {
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

export async function createIngredient({
  name,
  sugarContent,
  waterContent,
  category,
}: Ingredient) {
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

export async function deleteRecipe(id: string) {
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

export async function updateIngredient(id: string, fields = {}) {
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

export async function getAllIngredients() {
  try {
    const { rows: ingredients } = await client.query(`
      SELECT * FROM ingredients;
    `);
    return ingredients;
  } catch (error) {
    throw error;
  }
}

export async function getIngredient(id: string) {
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

export async function getIngredientsByCategory(cat: string) {
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

export async function getIngredientByName(name: string) {
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

export async function deleteIngredient(id: string) {
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

export async function createYeast({
  brand,
  name,
  nitrogenRequirement,
  tolerance,
  lowTemp,
  highTemp,
}: Yeast) {
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

export async function updateYeast(id: string, fields = {}) {
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

export async function getAllYeasts() {
  try {
    const { rows: yeasts } = await client.query(`
      SELECT * FROM yeasts;
    `);
    return yeasts;
  } catch (error) {
    throw error;
  }
}

export async function getYeastByName(name: string) {
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


export async function getYeastById(id: string) {
  try {
    const {
      rows: [yeast],
    } = await client.query(
      `
      SELECT * FROM yeasts WHERE id=$1;
    `,
      [id]
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


export async function getYeastByBrand(brand: string) {
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

export async function deleteYeast(id: string) {
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

export async function createHydrometerToken(userId: string) {
  const { randomUUID } = new ShortUniqueId();
  const token = randomUUID(10);

  try {
    const userToken = await client.query(`
      UPDATE users
      SET hydro_token=$1
      WHERE id=$2
      RETURNING *;
      `, [token, userId]);
    console.log(userToken);

    return {
      token,
    }

  } catch (error) {
    throw error;
  }

}