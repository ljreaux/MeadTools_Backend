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

export type LogType = {
  id: string;
  brew_id: string | null;
  device_id: string;
  angle: number;
  temperature: number;
  temp_units: "C" | "F";
  battery: number;
  gravity: number;
  interval: number;
  dateTime: Date;
  calculated_gravity: number | null;
};

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
    //* gets the appropriate recipe from the database and joins it with the iSpindel brews (if available)

    //* returns :

    //* {
    //*  recipe: {
    //*     ...,
    //*     brews: [...]
    //*   }
    //* }

    const { rows: [recipe] } = await client.query(
      `
      SELECT 
          recipes.*,
          COALESCE(
            json_agg(
              jsonb_build_object(
                'id', brews.id,
                'start_date', brews.start_date,
                'end_date', brews.end_date,
                'latest_gravity', brews.latest_gravity
              )
            ) FILTER (WHERE brews.id IS NOT NULL), '[]'
          ) AS brews
      FROM recipes
      LEFT JOIN brews 
        ON brews.recipe_id = recipes.id
      WHERE recipes.id = $1
      GROUP BY recipes.id;
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
  privateRecipe = false,
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
        privateRecipe,
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
      SELECT * FROM ingredients WHERE UPPER(name)=$1;
    `,
      [name.toUpperCase()]
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
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET hydro_token=$1
      WHERE id=$2
      RETURNING *;
      `,
      [token, userId]
    );

    return {
      userId: user.id,
      email: user.email,
      token: user.hydro_token,
    };
  } catch (error) {
    throw error;
  }
}

export async function getHydrometerToken(userId: string) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    SELECT hydro_token
    FROM users
    WHERE id=$1;
    `,
      [userId]
    );

    if (!user) {
      throw {
        name: "UserNotFoundError",
        message: "User not found",
      };
    }

    return user.hydro_token;
  } catch (error) {
    throw error;
  }
}

export async function verifyToken(token: string | undefined) {
  try {
    if (!token)
      throw {
        name: "TokenNotFoundError",
        message: "Token not found",
      };

    const {
      rows: [userId],
    } = await client.query(
      `
      SELECT id
      FROM users
      WHERE hydro_token=$1;
      `,
      [token]
    );

    if (!userId) {
      throw {
        name: "UserNotFoundError",
        message: "User not found",
      };
    }

    return userId.id;
  } catch (error) {
    throw error;
  }
}

export async function registerDevice({
  device_name,
  userId,
}: {
  device_name: string;
  userId: number;
}) {
  try {
    const { rows: found } = await client.query(
      `
      SELECT *
      FROM devices
      WHERE user_id=$1 AND device_name=$2;
      `,
      [userId, device_name]
    );

    const isRegistered = found.length > 0;

    if (isRegistered) return found[0];
    const {
      rows: [device],
    } = await client.query(
      `
      INSERT INTO devices (device_name, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
      `,
      [device_name, userId]
    );

    return device;
  } catch (error) {
    throw error;
  }
}

export function calcGravity([a, b, c, d]: number[], angle: number) {
  return a * Math.pow(angle, 3) + b * Math.pow(angle, 2) + c * angle + d;
}

export async function updateBrewGravity(brewId: string, gravity: number) {
  try {
    const {
      rows: [brew],
    } = await client.query(
      `
  UPDATE brews
  SET latest_gravity=$1
  WHERE id=$2
  `,
      [gravity, brewId]
    );

    return brew;
  } catch (error) {
    throw error;
  }
}

export async function createLog(log: LogType) {
  try {
    const {
      rows: [newLog],
    } = await client.query(
      `
    INSERT INTO logs (brew_id, device_id, angle, temperature, temp_units, battery, gravity, interval, calculated_gravity)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
    `,
      [
        log.brew_id,
        log.device_id,
        log.angle,
        log.temperature,
        log.temp_units,
        log.battery,
        log.gravity,
        log.interval,
        log.calculated_gravity,
      ]
    );

    return newLog;
  } catch (error) {
    throw error;
  }
}

export async function getLogs(
  deviceId: string,
  beginDate: Date,
  endDate: Date
) {
  try {
    const { rows } = await client.query(
      `
    SELECT * FROM logs 
    WHERE device_id=$1 AND 
    datetime BETWEEN $2 AND $3
    ORDER BY logs.datetime DESC;
  `,
      [deviceId, beginDate, endDate]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

export async function getBrews(userId?: string) {
  try {
    if (!userId) throw Error;

    const { rows: brews } = await client.query(
      `
    SELECT * FROM brews
    WHERE user_id=$1
    order by coalesce(end_date, CURRENT_TIMESTAMP) desc, start_date;
    `,
      [userId]
    );

    return brews;
  } catch (error) {
    throw error;
  }
}

export async function startBrew(deviceId: string, userId?: string, brewName = null) {
  try {
    if (!userId) throw Error;

    const {
      rows: [brew],
    } = await client.query(
      `
    INSERT INTO brews
    (user_id, name, start_date)
    VALUES ($1, $2, now())
    RETURNING *;
    `,
      [userId, brewName]
    );
    const {
      rows: [device],
    } = await client.query(
      `
    UPDATE devices 
    SET brew_id=$1
    WHERE id=$2
    RETURNING *;
  `,
      [brew.id, deviceId]
    );

    return [{ brew }, { device }];
  } catch (error) {
    throw error;
  }
}
export async function endBrew(
  deviceId: string,
  brewId: string,
  userId?: string
) {
  try {
    if (!userId) throw Error;

    const {
      rows: [brew],
    } = await client.query(
      `
    UPDATE brews
    SET end_date=now()
    WHERE user_id=$1 AND id=$2
    RETURNING *;
    `,
      [userId, brewId]
    );
    const {
      rows: [device],
    } = await client.query(
      `
    UPDATE devices 
    SET brew_id=null
    WHERE id=$1
    RETURNING *;
  `,
      [deviceId]
    );

    return [{ brew }, { device }];
  } catch (error) {
    throw error;
  }
}
export async function setBrewName(
  brewId: string,
  userId?: string,
  brewName = null
) {
  try {
    if (!userId) throw Error;

    const {
      rows: [brew],
    } = await client.query(
      `
    UPDATE brews
    SET name=$1
    WHERE user_id=$2 AND id=$3
    RETURNING *;
    `,
      [brewName, userId, brewId]
    );


    return [{ brew }, { device: null }];
  } catch (error) {
    throw error;
  }
}

export async function addBrewRec(
  recipeId: string,
  brewId: string,
  userId?: string
) {
  try {
    if (!userId) throw Error;

    const {
      rows: [brew],
    } = await client.query(
      `
    UPDATE brews
    SET recipe_id=$1
    WHERE user_id=$2 AND id=$3
    RETURNING *;
    `,
      [recipeId, userId, brewId]
    );

    return brew;
  } catch (error) {
    throw error;
  }
}

export async function getLogsForBrew(brewId: string, userId?: string) {
  try {
    const {
      rows: [brew],
    } = await client.query(
      `
      SELECT * FROM brews
      WHERE id=$1 AND user_id=$2;
    `,
      [brewId, userId]
    );

    if (brew.user_id !== userId)
      throw new Error("You are not authorized to view these logs");

    const { rows: logs } = await client.query(
      `
      SELECT * from logs
      WHERE brew_id=$1
      ORDER BY datetime ASC;
    `,
      [brewId]
    );

    return logs;
  } catch (error) {
    throw error;
  }
}

export async function updateLog(
  id: string,
  fields: LogType,
  deviceId?: string
) {
  try {
    if (!deviceId) throw Error;
    // build the set string
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(", ");

    const values = Object.values(fields);
    values.push(id, deviceId);

    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
    const {
      rows: [edited],
    } = await client.query(
      `
      UPDATE logs  
      SET ${setString}
      WHERE id=$${values.length - 1} AND device_id=$${values.length}
      RETURNING *;
    `,
      values
    );

    return edited;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update log");
  }
}

export async function deleteLog(id: string, deviceId?: string) {
  if (!deviceId) throw Error;
  try {
    await client.query(
      `
      DELETE FROM logs  
      WHERE id=$1 AND device_id=$2;
    `,
      [id, deviceId]
    );
    return { message: `Log ${id} deleted successfully.` };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete log");
  }
}

export async function getDevicesForUser(userId: string) {
  try {
    const { rows } = await client.query(
      `
      SELECT * FROM devices
      WHERE user_id=$1;
    `,
      [userId]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

export async function updateCoeff(
  deviceId: string,
  coefficients: number[],
  id?: string
) {
  try {
    if (!id) throw new Error("You must be the logged in user");
    const {
      rows: [device],
    } = await client.query(
      `
    UPDATE devices
    SET coefficients=$1
    WHERE id=$2 AND user_id=$3
    RETURNING *;
    `,
      [coefficients, deviceId, id]
    );
    return device;
  } catch (error) {
    throw error;
  }
}
