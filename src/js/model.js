import {API_KEY, API_URL, RESULTS_PER_PAGE} from "./config";
import {AJAX} from "./helpers";

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RESULTS_PER_PAGE
    },
    bookmarks: []
};

const createRecipeObject = function (data) {
    const {recipe} = data.data;

    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key})
    };
}

export const loadRecipe = async function (hashId) {
    try {
        const data = await AJAX(`${API_URL}${hashId}?key=${API_KEY}`);

        state.recipe = createRecipeObject(data);

        state.recipe.bookmarked = state.bookmarks.some((bookmark) => bookmark.id === hashId);
    } catch (error) {
        throw error;
    }
}

export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;

        const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);

        state.search.results = data.data.recipes.map(function (recipe) {
            return {
                id: recipe.id,
                title: recipe.title,
                publisher: recipe.publisher,
                image: recipe.image_url,
                ...(recipe.key && {key: recipe.key})
            };
        });
        state.search.page = 1;
    } catch (error) {
        throw error;
    }
}

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage, end = (page * this.state.search.resultsPerPage);
    return state.search.results.slice(start, end);
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(function (ingredient) {
        ingredient.quantity = (ingredient.quantity * newServings) / state.recipe.servings;
        // newQuantity = (oldQuantity * newServings) / oldServings
    })

    state.recipe.servings = newServings;
}

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookmark = function (recipe) {
    /* ADD BOOKMARK */
    state.bookmarks.push(recipe);

    /* MARK CURRENT RECIPE AS BOOKMARK */
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    /* SAVE TO LOCAL STORAGE */
    persistBookmarks();
}

export const removeBookmark = function (id) {
    /* DELETE BOOKMARK */
    const index = state.bookmarks.findIndex((element) => element.id === id);
    state.bookmarks.splice(index, 1);

    /* MARK CURRENT RECIPE AS NOT BOOKMARKED */
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    /* SAVE TO LOCAL STORAGE */
    persistBookmarks();
}

const init = function () {
    const storedData = localStorage.getItem('bookmarks');
    if (storedData) state.bookmarks = JSON.parse(storedData);
}

init();

/* DEBUGGING PURPOSE */
const clearBookmark = function () {
    localStorage.clear('bookmarks');
}

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe)
            .filter(function (entry) {
                const [firstEntry, secondEntry] = entry;
                return firstEntry.startsWith('ingredient') && secondEntry !== '';
            }).map(function (ingredient) {
                const ingredientArray = ingredient[1].split(',').map(function (element) {
                    return element.trim();
                });
                if (ingredientArray.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format ☹');
                const [quantity, unit, description] = ingredientArray;
                return {quantity: quantity ? +quantity : null, unit, description};
            });

        const recipeData = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipeData);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (error) {
        throw error;
    }
}