const bcrypt = require("bcrypt");

const {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUser,
  getAllRecipesForUser,
  getRecipeInfo,
  createRecipe,
  updateRecipe,
  createIngredient,
  updateIngredient,
  getAllIngredients,
  getIngredient,
  getIngredientsByCategory,
  getIngredientByName,
  createYeast,
  updateYeast,
  getAllYeasts,
  getYeastByName,
  getYeastByBrand,
} = require("./index");

const INGREDIENTS = require("./fermentables.js");
const YEASTS = require("./yeast.js");

async function dropTables() {
  try {
    console.log("Starting drop tables");
    await client.query(`
    DROP TABLE IF EXISTS recipes;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS ingredients;
    DROP TABLE IF EXISTS ingredient_categories;
    DROP TABLE IF EXISTS yeasts;`);

    console.log("Tables dropped");
  } catch (error) {
    console.error("Error while dropping tables");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Creating tables...");
    await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      first_name varchar(255),
      last_name varchar(255),
      username varchar(255) UNIQUE NOT NULL,
      email varchar(255) NOT NULL,
      password varchar(255) NOT NULL,
      role varchar(255) DEFAULT 'user'
    );

    CREATE TABLE recipes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name varchar(255) NOT NULL,
      ingredients TEXT NOT NULL,
      units varchar(255) NOT NULL,
      vol_units varchar(255) NOT NULL,
      row_count int NOT NULL,
      submitted boolean DEFAULT true NOT NULL,
      yeast_info TEXT NOT NULL,
      yeast_brand varchar(255) NOT NULL,
      nute_schedule varchar(255) NOT NULL,
      num_of_additions int NOT NULL,
      extra_ingredients TEXT NOT NULL
    );

    CREATE TABLE ingredients (
      id SERIAL PRIMARY KEY,
      name varchar(255) NOT NULL,
      sugar_content numeric NOT NULL,
      water_content numeric NOT NULL,
      category varchar(255) NOT NULL
    );

    CREATE TABLE yeasts (
      id SERIAL PRIMARY KEY,
      brand varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      nitrogen_requirement varchar(255) NOT NULL,
      tolerance numeric NOT NULL,
      low_temp numeric NOT NULL,
      high_temp numeric NOT NULL
    );

    `);
    console.log("Tables created");
  } catch (error) {
    console.error("Error while creating tables");
    throw error;
  }
}

async function createInitialUsers() {
  const password = await bcrypt.hash("PASSWORD", 10);
  const ADMIN_USER = {
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    email: "contact@meadtools.com",
    password,
    role: "admin",
  };
  const USER = {
    firstName: "User",
    lastName: "User",
    username: "user",
    email: "contact@meadtools.com",
    password,
    role: "user",
  };
  try {
    await createUser(ADMIN_USER);
    await createUser(USER);
    console.log("Initial users created");
  } catch (error) {
    console.error("Error while creating initial users");
    throw error;
  }
}

async function createInitialRecipes() {
  const ingredients = {
    input1: {
      name: "Honey",
      weight: "3",
      brix: 79.6,
      volume: "0.254",
      cat: "sugar",
    },
    input2: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input3: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input4: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input5: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input6: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input7: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input8: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input9: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input10: { name: "Honey", weight: 0, brix: 79.6, volume: 0, cat: "sugar" },
    input11: {
      name: "Water",
      weight: "6.259",
      brix: "0",
      volume: ".75",
      cat: "sugar",
    },
    input12: { name: "Water", weight: 0, brix: "0", volume: 0, cat: "sugar" },
  };
  const yeastInfo = [
    {
      name: "ICV D47",
      "Nitrogen Requirement": "Low",
      "ABV Tolerance": 17,
      LowTemp: 50,
      HighTemp: 86,
    },
  ];

  const extra_ingredients = {
    input1: { name: "Opti-White", amount: "1.1", units: "g" },
    input2: { name: "", amount: 0, units: "g" },
    input3: { name: "", amount: 0, units: "g" },
    input4: { name: "", amount: 0, units: "g" },
    input5: { name: "", amount: 0, units: "g" },
  };

  const TRADITIONAL_MEAD = {
    userId: 1,
    name: "Traditional Mead",
    ingredients: JSON.stringify(ingredients),
    units: "lbs",
    volUnits: "gal",
    rowCount: 0,
    submitted: true,
    yeastInfo: JSON.stringify(yeastInfo),
    yeastBrand: "Lalvin",
    nuteSchedule: "tosna",
    numOfAdditions: 3,
    extraIngredients: JSON.stringify(extra_ingredients),
  };

  const MEAD_TWO = { ...TRADITIONAL_MEAD, name: "TWO" };

  try {
    console.log("Creating initial recipes...");
    await createRecipe(TRADITIONAL_MEAD);
    await createRecipe(MEAD_TWO);
    console.log("Initial recipes created");
  } catch (error) {
    console.error("Error while creating initial recipes");
    throw error;
  }
}

async function createInitialIngredients() {
  try {
    console.log("Creating initial ingredients...");
    INGREDIENTS.forEach(async (ingredient) => {
      await createIngredient(ingredient);
    });
    console.log("Initial ingredients created");
  } catch (error) {
    console.error("Error while creating initial ingredients");
    throw error;
  }
}

async function createInitialYeasts() {
  try {
    for (const [key, value] of Object.entries(YEASTS)) {
      const values = await Promise.all(
        value.map(async (yeast) => {
          const createdYeast = await createYeast({ ...yeast, brand: key });
          return createdYeast;
        })
      );
    }
    console.log("Initial Yeasts Created");
  } catch (error) {
    console.error("Error while creating initial yeasts");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialRecipes();
    await createInitialIngredients();
    await createInitialYeasts();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Getting all users...");
    const users = await getAllUsers();
    console.log("Result:", users);

    const { id: userId } = users[0];

    const { id } = await getUser(userId);
    console.log("Got user:", id);

    console.log("Calling updateUser on Admin...");
    const updatedUser = await updateUser(id, {
      first_name: "Larry",
      last_name: "Reaux",
    });
    console.log("Updated user:", updatedUser);

    console.log("Getting all recipes from Larry");
    const recipes = await getAllRecipesForUser(id);
    console.log("Result:", recipes);

    console.log("Calling getRecipe for recipeId 1");
    const recipe = await getRecipeInfo(1);
    console.log("Got recipe:", recipe);

    console.log("Calling updateRecipe for recipeId 1");
    const updatedRecipe = await updateRecipe(1, {
      row_count: 1,
    });
    console.log("Updated recipe:", updatedRecipe);
  } catch (error) {
    console.error("Error during testDB", error);
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
