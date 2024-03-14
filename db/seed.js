const bcrypt = require("bcrypt");
require("dotenv").config();

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
  const adminPassword = bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  const userPassword = bcrypt.hash(process.env.USER_PASSWORD, 10);
  const ADMIN_USER = {
    firstName: "Admin",
    lastName: "User",
    username: "admin",
    email: "contact@meadtools.com",
    password: adminPassword,
    role: "admin",
  };
  const USER = {
    firstName: "User",
    lastName: "User",
    username: "user",
    email: "contact@meadtools.com",
    password: userPassword,
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

    console.log("Calling deleteRecipe for recipeId 1");
    const deletedRecipe = await deleteRecipe(1);
    console.log("Deleted recipe:", deletedRecipe);

    console.log("creating test ingredient...");
    const ingredient = await createIngredient({
      name: "test",
      sugarContent: 50,
      waterContent: 50,
      category: "sugar",
    });
    console.log("Created ingredient:", ingredient);

    console.log("editing test ingredient");
    const editedIngredient = await updateIngredient(ingredient.id, {
      name: "edited",
      sugar_content: 20,
      water_content: 20,
      category: "fruit",
    });
    console.log("Edited ingredient:", editedIngredient);

    console.log("deleting test ingredient");
    const deletedIngredient = await deleteIngredient(ingredient.id);
    console.log("Deleted ingredient:", deletedIngredient);

    console.log("Getting all ingredients");
    const ingredients = await getAllIngredients();
    console.log(
      "Result:",
      ingredients[0],
      "...",
      ingredients[`${ingredients.length - 1}`]
    );

    console.log("Getting ingredient with the id: " + 1);
    const ingredientInfo = await getIngredient(1);
    console.log("Got ingredient:", ingredientInfo);

    console.log("Getting all ingredients in the fruit category");
    const fruits = await getIngredientsByCategory("fruit");
    console.log("Got all fruits:", fruits);

    console.log("Getting ingredient with the name: honey");
    const honey = await getIngredientByName("Honey");
    console.log("Got honey:", honey);

    console.log("testing create new yeast");
    const yeast = await createYeast({
      brand: "Lalvin",
      name: "test",
      nitrogenRequirement: "Low",
      tolerance: 16,
      lowTemp: 50,
      highTemp: 60,
    });
    console.log("Created yeast:", yeast);

    console.log("Editing yeast with the id:", yeast.id);
    const editedYeast = await updateYeast(yeast.id, {
      brand: "Other",
      name: "Editing",
      nitrogen_requirement: "Medium",
      tolerance: 16,
      low_temp: 50,
      high_temp: 60,
    });
    console.log("Edited yeast:", editedYeast);

    console.log("Deleting yeast with the id:", yeast.id);
    const deletedYeast = await deleteYeast(yeast.id);
    console.log("Deleted yeast:", deletedYeast);

    console.log("Getting all yeasts");
    const yeasts = await getAllYeasts();
    console.log("Result:", yeasts[0], "...", yeasts[`${yeasts.length - 1}`]);

    console.log("Getting yeast with the name: " + yeasts[0].name);
    const yeastInfo = await getYeastByName(yeasts[0].name);
    console.log("Got yeast:", yeastInfo);

    console.log("Getting all 'Other' yeasts");
    const otherYeasts = await getYeastByBrand("Other");
    console.log(
      "Result:",
      otherYeasts[0],
      "...",
      otherYeasts[`${otherYeasts.length - 1}`]
    );
  } catch (error) {
    console.error("Error during testDB", error);
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
