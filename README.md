# MeadTools_Backend

##API

###Requirements

1. Yeasts endpoint ('api/yeasts')
    1. '/'
        - GET request for all yeasts
    2. '/:brand'
        - GET request for all yeasts of a brand
    3. '/query'
        - GET request for a single yeast
        - Uses query string (searchable)
    4. '/admin'
        - POST and DELETE requests to add/update and delete yeast entries
        - Authoriztion protected, only available to Admin
2. Ingredients endpoint ('api/ingredients')
    1. '/'
        - GET request for all ingredients
    2. '/:ingredient'
        - GET request for individual ingredients
    3. '/category'
        - GET request for all ingredients in a category
    4. '/admin'
        - POST and DELETE requests to add/update and delete ingredient entries
        - Authoriztion protected, only available to Admin
3. Users endpoint ('api/users')
    1. '/register'
        - POST request to create a new user
        - res is the user token
        - Information stored about each user:
          ```
              {
                firstName: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                recipes: [],
              }
          ```
    2. '/login'
        - GET request with JWT authentication
    3. '/accountInfo'
        - GET request for account info
    4. 'accountInfo/recipes'
        - GET request for all of an individuals recipes
    5. 'accountInfo/recipes/pdf'
        - GET request for an individual recipe pdf
    6. '/addRecipe'
        - POST request to add a new recipe to your account
    7. '/deleteRecipe'
        - DELETE request to delete a recipe from your account
