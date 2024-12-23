import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

import {
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
  User,
  Yeast,
} from "./index";

import INGREDIENTS from "./fermentables.js";
import YEASTS from "./yeast.js";

async function dropTables() {
  try {
    console.log("Starting drop tables");
    await client.query(`
    DROP TABLE IF EXISTS logs;
    DROP TABLE IF EXISTS devices;
    DROP TABLE IF EXISTS brews;
    DROP TABLE IF EXISTS recipes;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS ingredients;
    DROP TABLE IF EXISTS yeasts;
    DROP TYPE IF EXISTS temp_units;
    `);

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
    CREATE TYPE temp_units AS ENUM ('F', 'C', 'K');

    CREATE TABLE users (
      id serial not null,
      email character varying(255) not null,
      password character varying(255) null,
      google_id character varying(255) null,
      role character varying(255) null default 'user'::character varying,
      hydro_token text null,
      constraint users_pkey primary key (id),
      constraint users_email_key unique (email),
      constraint users_hydro_token_key unique (hydro_token),
      constraint users_hydro_token_check check ((length(hydro_token) = 10))
    ); 

    CREATE TABLE recipes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name varchar(255) NOT NULL,
      "recipeData" TEXT NOT NULL,
      "yanFromSource" varchar(255),
      "yanContribution" varchar(255) NOT NULL,
      "nutrientData" TEXT NOT NULL,
      advanced bool NOT NULL,
      "nuteInfo" TEXT,
      "primaryNotes" TEXT[],
      "secondaryNotes" TEXT[],
      "private" bool NOT NULL DEFAULT false
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

    CREATE TABLE brews  (
    id uuid not null default gen_random_uuid (),
    start_date timestamp with time zone not null default now(),
    end_date timestamp with time zone null,
    user_id integer null,
    latest_gravity real null,
    recipe_id integer null,
    name text null,
    constraint brews_pkey primary key (id),
    constraint brews_recipe_id_fkey foreign key (recipe_id) references recipes (id),
    constraint brews_user_id_fkey foreign key (user_id) references users (id)
  );

    CREATE TABLE devices (
      id uuid not null default gen_random_uuid (),
      device_name text null,
      recipe_id integer null,
      user_id integer not null,
      coefficients real[] not null default '{}'::real[],
      brew_id uuid null,
      constraint devices_pkey primary key (id),
      constraint devices_brew_id_fkey foreign key (brew_id) references brews (id),
      constraint devices_recipe_id_fkey foreign key (recipe_id) references recipes (id),
      constraint devices_user_id_fkey foreign key (user_id) references users (id)
    );

    CREATE TABLE logs (
      id uuid not null default gen_random_uuid (),
      datetime timestamp with time zone not null default now(),
      angle real not null,
      temperature real not null,
      temp_units public.temp_units not null,
      battery real not null,
      gravity real not null,
      interval integer not null,
      calculated_gravity real null,
      device_id uuid null,
      brew_id uuid null,
      constraint logs_pkey primary key (id),
      constraint logs_brew_id_fkey foreign key (brew_id) references brews (id),
      constraint logs_device_id_fkey foreign key (device_id) references devices (id)
    );

    `);
    console.log("Tables created");
  } catch (error) {
    console.error("Error while creating tables");
    throw error;
  }
}

async function createInitialUsers() {
  let adminPassword;
  let userPassword;
  if (process.env.ADMIN_PASSWORD && process.env.USER_PASSWORD) {
    adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    userPassword = await bcrypt.hash(process.env.USER_PASSWORD, 10);
  }
  const ADMIN_USER: User = {
    email: "larryreaux@gmail.com",
    password: adminPassword,
    role: "admin",
    googleId: null,
  };
  const USER: User = {
    email: "contact@meadtools.com",
    password: userPassword,
    role: "user",
    googleId: null,
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
  const yeastInfo = [
    {
      name: "ICV D47",
      "Nitrogen Requirement": "Low",
      "ABV Tolerance": 17,
      LowTemp: 50,
      HighTemp: 86,
    },
  ];

  const TRADITIONAL_MEAD = {
    userId: 1,
    name: "Traditional Mead",
    recipeData: JSON.stringify({
      ingredients: [
        {
          name: "water",
          brix: 0,
          details: [8.3451, 1],
          secondary: false,
          category: "water",
        },
        {
          name: "water",
          brix: 0,
          details: [0, 0],
          secondary: false,
          category: "water",
        },
        {
          name: "honey",
          brix: 79.6,
          details: [3, 0.2541],
          secondary: false,
          category: "sugar",
        },
        {
          name: "honey",
          brix: 79.6,
          details: [0, 0],
          secondary: false,
          category: "sugar",
        },
      ],
      OG: 1.084080896077745,
      volume: 1.2541,
      ABV: 11.62,
      FG: 0.996,
      offset: 0,
      units: { weight: "lbs", volume: "gal" },
      additives: [{ name: "Red Wine Tannin", amount: 3, unit: "g" }],
      sorbate: -3.931989930416225,
      sulfite: 0.416383201754386,
    }),
    yanFromSource: null,
    yanContribution: JSON.stringify([40, 100, 210]),
    nuteInfo: JSON.stringify({
      ppmYan: [72, 50, 50],
      totalGrams: [2.136045825, 2.37338425, 1.1301829761904763],
      perAddition: [2.136045825, 2.37338425, 1.1301829761904763],
      remainingYan: 0,
      totalYan: 172,
      gf: { gf: 3.14, gfWater: 62.75 },
    }),
    advanced: false,
    nutrientData: JSON.stringify({
      inputs: { volume: 1.2541, sg: 1.088, offset: 0, numberOfAdditions: 1 },
      selected: {
        yeastBrand: "Lalvin",
        yeastStrain: "18-2007",
        yeastDetails: {
          id: 1,
          brand: "Lalvin",
          name: "18-2007",
          nitrogen_requirement: "Low",
          tolerance: "15",
          low_temp: "50",
          high_temp: "90",
        },
        n2Requirement: "Low",
        volumeUnits: "gal",
        schedule: "tbe",
      },
      maxGpl: {
        tbe: { name: "TBE (All Three)", value: [0.45, 0.5, 0.96] },
        tosna: { name: "TOSNA (Fermaid O Only)", value: [2.5, 0, 0] },
        justK: { name: "Fermaid K Only", value: [0, 3, 0] },
        dap: { name: "DAP Only", value: [0, 0, 1.5] },
        oAndk: {
          name: "Fermaid O & K",
          value: [
            [0.6, 0.81, 0],
            [0.9, 0.81, 0],
            [1.1, 1, 0],
          ],
        },
        oAndDap: { name: "Fermaid O & DAP", value: [1, 0, 0.96] },
        kAndDap: { name: "Fermaid K & DAP", value: [0, 1, 0.96] },
      },
      yanContribution: [40, 100, 210],
      outputs: { targetYan: 172, yeastAmount: 2.51 },
      primaryNotes: ["testing notes", "1.100, 12/12/12"],
    }),
  };

  const MEAD_TWO = {
    ...TRADITIONAL_MEAD,
    name: "TWO",
    secondaryNotes: ["testing notes", ""],
  };

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
        value.map(async (yeast: Yeast) => {
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
      email: "admin@meadtools.com",
    });
    console.log("Updated user:", updatedUser);

    console.log("Getting all recipes from Larry");
    const recipes = await getAllRecipesForUser(id);
    console.log("Result:", recipes);

    console.log("Calling getRecipe for recipeId 1");
    const recipe = await getRecipeInfo("1");
    console.log("Got recipe:", recipe);

    console.log("Calling updateRecipe for recipeId 1");
    const updatedRecipe = await updateRecipe("1", {
      yanFromSource: JSON.stringify([40, 100, 210]),
    });
    console.log("Updated recipe:", updatedRecipe);

    console.log("Calling deleteRecipe for recipeId 1");
    const deletedRecipe = await deleteRecipe("1");
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
    const ingredientInfo = await getIngredient("1");
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
