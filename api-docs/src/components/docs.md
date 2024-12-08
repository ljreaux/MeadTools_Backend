---
title: MeadTools API Documentation
author: Larry Reaux
description: These are the docs for the MeadTools API
---

# MeadTools API Documentation

## Description

This api serves as the backend for MeadTools and MeadTools Mobile. It was created using Express.js and TypeScript. It is hosted on vercel and is licensed under MIT license. It connects to a PostgreSQL database hosted on Supabase.

**Table of Contents**

- [MeadTools API Documentation](#meadtools-api-documentation)
  - [Description](#description)
  - [API Routes](#api-routes)
    - [Ingredients](#ingredients)
      - [GET /api/ingredients](#get-apiingredients)
      - [POST /api/ingredients](#post-apiingredients)
      - [GET /api/ingredients/category/_:categoryName_](#get-apiingredientscategorycategoryname)
      - [GET /api/ingredients/_:ingredientName_](#get-apiingredientsingredientname)
      - [PATCH /api/ingredients/_:ingredientId_](#patch-apiingredientsingredientid)
      - [DELETE /api/ingredients/_:ingredientId_](#delete-apiingredientsingredientid)
    - [iSpindel](#ispindel)
      - [GET /api/ispindel](#get-apiispindel)
      - [POST /api/ispindel](#post-apiispindel)
      - [GET /api/ispindel/logs](#get-apiispindellogs)
      - [GET /api/ispindel/logs/_:brewId_](#get-apiispindellogsbrewid)
      - [PATCH /api/ispindel/logs/_:logId_](#patch-apiispindellogslogid)
      - [DELETE /api/ispindel/logs/_:logId_](#delete-apiispindellogslogid)
      - [GET /api/ispindel/brew](#get-apiispindelbrew)
      - [POST /api/ispindel/brew](#post-apiispindelbrew)
      - [PATCH /api/ispindel/brew](#patch-apiispindelbrew)
      - [PATCH /api/ispindel/brew/_:brewId_](#patch-apiispindelbrewbrewid)
      - [PATCH /api/ispindel/device/_:deviceId_](#patch-apiispindeldevicedeviceid)
    - [Recipes](#recipes)
      - [GET /api/recipes/](#get-apirecipes)
      - [POST /api/recipes/](#post-apirecipes)
      - [GET /api/recipes/_:id_](#get-apirecipesid)
      - [PATCH /api/recipes/_:id_](#patch-apirecipesid)
      - [DELETE /api/recipes/_:id_](#delete-apirecipesid)

## API Routes

Admin only routes are noted with Red Heading color.

### Ingredients

#### GET /api/ingredients

- No request body or authorization required.
- Returns list of all ingredients

```json title="Sample Response"
[
  {
    "id": 1,
    "name": "Honey",
    "sugar_content": "79.6",
    "water_content": "15.5",
    "category": "sugar"
  }
]
```

#### <span style="color: red">POST /api/ingredients<span>

- Allows admin to add new ingredient

```typescript title="Request Types"
type NewIngredient = {
  name: string;
  sugarContent: number;
  waterContent: number;
  category: string;
};
```

```json title="Sample Response"
[
  {
    "id": 1,
    "name": "Honey",
    "sugar_content": "79.6",
    "water_content": "15.5",
    "category": "sugar"
  }
]
```

#### GET /api/ingredients/category/_:categoryName_

- Gets all ingredients in a given category
- No Authentication required

```text title="Sample Parameters"
fruit, sugar, vegetable, ...

```

```json title="Sample Response"
[
  {
    "id": 6,
    "name": "Apples",
    "sugar_content": "11.58",
    "water_content": "84.6",
    "category": "fruit"
  },
  {
    "id": 8,
    "name": "Apricot",
    "sugar_content": "9.17",
    "water_content": "84.6",
    "category": "fruit"
  }
]
```

#### GET /api/ingredients/_:ingredientName_

- Finds ingredient with matching name
- Case insensitive

```text title="Sample Parameters"
honey, brown sugar, onion, ...

```

```json title="Sample Response"
{
  "id": 6,
  "name": "Apples",
  "sugar_content": "11.58",
  "water_content": "84.6",
  "category": "fruit"
}
```

```json title="Not Found"
{
  "name": "IngredientNotFoundError",
  "message": "Ingredient not found"
}
```

#### <span style="color: red">PATCH /api/ingredients/_:ingredientId_</span>

- Allows admin to edit ingredients

```typescript title="Request Types"
type Ingredient = {
  name: string;
  sugar_content: number;
  water_content: number;
  category: string;
};
```

```json title="Sample Response"
{
  "id": 6,
  "name": "Edited Ingredient",
  "sugar_content": "11.58",
  "water_content": "84.6",
  "category": "fruit"
}
```

#### <span style="color: red">DELETE /api/ingredients/_:ingredientId_</span>

- Allows admin to delete ingredients

```json title="Sample Response"
{
  "name": "Success",
  "message": "Sample Ingredient has been deleted"
}
```

### iSpindel

#### GET /api/ispindel

- User Required

```typescript title="Sample Response"
{
  hydrometerToken: "LmyELJa0kM",
  devices: [
        {
            id: "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
            device_name: "Test Device",
            recipe_id: null,
            user_id: 1,
            coefficients: [],
            brew_id: null
        }
    ]
}
```

#### POST /api/ispindel

- Meant for use by iSpindel device
- Must supply a valid token
- device_name used to identify device

```json title="Sample Request"
{
  "name": "Test Device",
  "ID": 12345678,
  "token": "LmyELJa0kM",
  "angle": 27.33976555,
  "temperature": 77.78749847,
  "temp_units": "F",
  "battery": 4.098018646,
  "gravity": 0.942535937,
  "interval": 180,
  "RSSI": -42
}
```

```json title="Sample Response (Not received by iSpindel device)"
{
  "id": "b963fd29-8518-4275-bb25-a9932d3eafbe",
  "datetime": "2024-10-11T00:25:06.175Z",
  "angle": 27.339766,
  "temperature": 77.7875,
  "temp_units": "F",
  "battery": 4.0980186,
  "gravity": 0.94253594,
  "interval": 180,
  "calculated_gravity": 0,
  "device_id": "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
  "brew_id": null
}
```

#### GET /api/ispindel/logs

- User Required
- Requires start_date, end_date, and device_id query params

```typescript title="Example Request"
const getLogs = async (
  token: string,
  start_date: string,
  end_date: string,
  device_id: string
) => {
  const url = `${API_URL}/ispindel/logs?start_date=${start_date}&end_date=${end_date}&device_id=${device_id}`;
  const { data, status } = await axios.get(url, {
    headers: { Authorization: "Bearer " + token },
  });
  if (status === 200) {
    return data;
  } else {
    console.error("Failed to get logs", status);
  }
};
```

```json title="Sample Response"
[
  {
    "id": "b963fd29-8518-4275-bb25-a9932d3eafbe",
    "datetime": "2024-10-11T00:25:06.175Z",
    "angle": 27.339766,
    "temperature": 77.7875,
    "temp_units": "F",
    "battery": 4.0980186,
    "gravity": 0.94253594,
    "interval": 180,
    "calculated_gravity": 0,
    "device_id": "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
    "brew_id": null
  }
]
```

#### GET /api/ispindel/logs/_:brewId_

- User Required
- Gets a list of logs for a given brew

```json title="Sample Response"
[
  {
    "id": "b963fd29-8518-4275-bb25-a9932d3eafbe",
    "datetime": "2024-10-11T00:25:06.175Z",
    "angle": 27.339766,
    "temperature": 77.7875,
    "temp_units": "F",
    "battery": 4.0980186,
    "gravity": 0.94253594,
    "interval": 180,
    "calculated_gravity": 0,
    "device_id": "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
    "brew_id": null
  }
]
```

#### PATCH /api/ispindel/logs/_:logId_

- User Required
- Allows user to edit a specific log
- device_id query param needed to check if log belongs to user

```typescript title="Sample Request"
const id = "b963fd29-8518-4275-bb25-a9932d3eafbe";
const device_id = "d6ed8ed5-2ff1-4692-bbcc-44c921363354";
const fields = {
  datetime: "2024-10-11T00:58:53.647Z",
};

const { data, status } = await axios.patch(
  `${API_URL}/ispindel/logs/${id}?device_id=${device_id}`,
  fields,
  { headers: { Authorization: "Bearer " + token } }
);
```

```json title="Sample Response"
{
  "id": "b963fd29-8518-4275-bb25-a9932d3eafbe",
  "datetime": "2024-10-11T00:58:53.647Z",
  "angle": 27.339766,
  "temperature": 77.7875,
  "temp_units": "F",
  "battery": 4.0980186,
  "gravity": 0.94253594,
  "interval": 180,
  "calculated_gravity": 0,
  "device_id": "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
  "brew_id": null
}
```

#### DELETE /api/ispindel/logs/_:logId_

- User Required
- Allows user to delete a specific log
- device_id query param needed to check if log belongs to user

```json title="Sample Response"
{
  "message": "Log b963fd29-8518-4275-bb25-a9932d3eafbe deleted successfully."
}
```

#### GET /api/ispindel/brew

- User Required
- Gets a list of brews for the current user

```json title="Sample Response"
[
  {
    "id": "561b87a8-2146-45dd-8127-52eb0925ffd6",
    "start_date": "2024-10-07T23:29:59.455Z",
    "end_date": "2024-10-07T23:30:00.450Z",
    "user_id": 1,
    "latest_gravity": null,
    "recipe_id": null
  }
]
```

#### POST /api/ispindel/brew

- User Required
- Starts a brew for a device
- device_id required in body of request

```json title="Sample Response"
[
  {
    "brew": {
      "id": "5d40fb11-1165-47b4-939b-255b91cdf72f",
      "start_date": "2024-10-11T22:10:48.620Z",
      "end_date": null,
      "user_id": 1,
      "latest_gravity": null,
      "recipe_id": null
    }
  },
  {
    "device": {
      "id": "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
      "device_name": "Test Device",
      "recipe_id": null,
      "user_id": 1,
      "coefficients": [],
      "brew_id": "5d40fb11-1165-47b4-939b-255b91cdf72f"
    }
  }
]
```

#### PATCH /api/ispindel/brew

- User Required
- Ends a brew for a device
- device_id AND brew_id required in body of request

```json title="Sample Response"
[
  {
    "brew": {
      "id": "f68443fe-a3c8-4133-8128-09ca6a409a01",
      "start_date": "2024-10-11T22:13:49.013Z",
      "end_date": "2024-10-11T22:14:12.858Z",
      "user_id": 1,
      "latest_gravity": null,
      "recipe_id": null
    }
  },
  {
    "device": {
      "id": "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
      "device_name": "Test Device",
      "recipe_id": null,
      "user_id": 1,
      "coefficients": [],
      "brew_id": null
    }
  }
]
```

#### PATCH /api/ispindel/brew/_:brewId_

- User Required
- Adds a meadtools recipe to the current brew
- recipe_id required in body of request

```json title="Sample Response"
{
  "id": "f68443fe-a3c8-4133-8128-09ca6a409a01",
  "start_date": "2024-10-11T22:13:49.013Z",
  "end_date": "2024-10-11T22:14:12.858Z",
  "user_id": 1,
  "latest_gravity": null,
  "recipe_id": 4
}
```

#### PATCH /api/ispindel/device/_:deviceId_

- User Required
- Used to update the coefficients for the device
- coefficients added in body of request (an array of 4 numbers)

```json title="Sample Response"
{
  "id": "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
  "device_name": "Test Device",
  "recipe_id": null,
  "user_id": 1,
  "coefficients": [0.0000019428612, -0.0002776549, 0.014086239, 0.77926403],
  "brew_id": null
}
```

### Recipes

#### <span style="color: red">GET /api/recipes/</span>

- Allows admin to get a list of all recipes

```json title="Sample Response"
{
  "recipes": [
    {
      "id": 152,
      "user_id": 3,
      "name": "Oxebar KLP",
      "recipeData": "{\"ingredients\":[{\"name\":\"Water\",\"brix\":0,...",
      "yanFromSource": null,
      "yanContribution": "[40,100,210]",
      "nutrientData": "{\"inputs\":{\"volume\":1.357,\"sg\":1.06,\"offset\":0,\"numberOfAdditions\":3},...",
      "advanced": false,
      "nuteInfo": "{\"ppmYan\":[117],...",
      "primaryNotes": ["..."],
      "secondaryNotes": ["..."],
      "private": false
    }
  ]
}
```

#### POST /api/recipes/

- User Required

```typescript title="Request Types"
type Recipe = {
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
};
```

#### GET /api/recipes/_:id_

- User Match or Admin Required

```json title="Sample Response"
{
  "id": 152,
  "user_id": 3,
  "name": "Oxebar KLP",
  "recipeData": "{\"ingredients\":[{\"name\":\"Water\",\"brix\":0,...",
  "yanFromSource": null,
  "yanContribution": "[40,100,210]",
  "nutrientData": "{\"inputs\":{\"volume\":1.357,\"sg\":1.06,\"offset\":0,\"numberOfAdditions\":3},...",
  "advanced": false,
  "nuteInfo": "{\"ppmYan\":[117],...",
  "primaryNotes": ["..."],
  "secondaryNotes": ["..."],
  "private": false,
  "brews": [
    {
      "id": "d6ed8ed5-2ff1-4692-bbcc-44c921363354",
      "start_date": "2024-10-11T00:02:31.610Z",
      "end_date": "2024-10-11T00:02:31.610Z",
      "latest_gravity": 1.1
    }
  ]
}
```

```json title="Unauthorized Response"
{
  "name": "UnauthorizedError",
  "message": "You are not authorized to perform this action"
}
```

#### PATCH /api/recipes/_:id_

- User Match or Admin Required

```typescript title="Request Types"
type Recipe = {
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
};
```

```json title="Sample Response"
{
  "id": 152,
  "user_id": 3,
  "name": "Oxebar KLP",
  "recipeData": "{\"ingredients\":[{\"name\":\"Water\",\"brix\":0,...",
  "yanFromSource": null,
  "yanContribution": "[40,100,210]",
  "nutrientData": "{\"inputs\":{\"volume\":1.357,\"sg\":1.06,\"offset\":0,\"numberOfAdditions\":3},...",
  "advanced": false,
  "nuteInfo": "{\"ppmYan\":[117],...",
  "primaryNotes": ["..."],
  "secondaryNotes": ["..."],
  "private": false
}
```

```json title="Unauthorized Response"
{
  "name": "UnauthorizedError",
  "message": "You are not authorized to perform this action"
}
```

#### DELETE /api/recipes/_:id_

- User Match or Admin Required

```json title="Sample Response"
{
  "name": "success",
  "message": "Sample Recipe has been successfully deleted."
}
```

```json title="Unauthorized Response"
{
  "name": "UnauthorizedError",
  "message": "You are not authorized to perform this action"
}
```
