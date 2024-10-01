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

```typescript title="Request Parameters"
{
  name: string,
  sugarContent: number,
  waterContent: number,
  category: string
}
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

```typescript title="Request Parameters"
{
  name: string;
  sugar_content: number;
  water_content: number;
  category: string;
}
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
