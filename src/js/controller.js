'use strict';

import * as model from './model';
import recipeView from './views/RecipeView';
import searchView from './views/SearchView';
import resultsView from './views/ResultsView';
import paginationView from './views/PaginationView';
import bookmarksView from './views/BookmarksView';
import addRecipeView from './views/AddRecipeView';
import { MODAL_CLOSE_DURATION } from './config';

const controlRecipes = async function () {
  try {
    const hashId = window.location.hash.slice(1);
    if (!hashId) return;

    /* LOAD SPINNER */
    recipeView.renderSpinner();

    /* UPDATE RESULTS VIEW TO MARK SELECTED SEARCH RESULT */
    resultsView.update(model.getSearchResultsPage());

    /* UPDATE BOOKMARK */
    bookmarksView.update(model.state.bookmarks);

    /* LOADING RECIPE */
    await model.loadRecipe(hashId);

    /* RENDER RECIPE */
    recipeView.render(model.state.recipe);
  } catch (error) {
    /* SHOW ERROR MESSAGE */
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    /* LOAD SPINNER */
    resultsView.renderSpinner();

    /* GET SEARCH QUERY */
    const query = searchView.getQuery();
    if (!query) return;

    /* LOAD SEARCH RESULTS */
    await model.loadSearchResults(query);

    /* RENDER RESULTS */
    resultsView.render(model.getSearchResultsPage(1));

    /* RENDER INITIAL PAGINATION BUTTONS */
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {
  /* RENDER NEW RESULTS */
  resultsView.render(model.getSearchResultsPage(goToPage));

  /* RENDER NEW PAGINATION BUTTONS */
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  /* UPDATE RECIPE SERVINGS */
  model.updateServings(newServings);

  /* UPDATE THE RECIPE VIEW */
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  /* ADD OR REMOVE BOOKMARK */
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.removeBookmark(model.state.recipe.id);

  /* UPDATE RECIPE VIEW */
  recipeView.update(model.state.recipe);

  /* RENDER BOOKMARKS */
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    /* LOAD SPINNER */
    addRecipeView.renderSpinner();

    /* UPLOAD THE NEW RECIPE DATA*/
    await model.uploadRecipe(newRecipe);

    /* RENDER RECIPE */
    recipeView.render(model.state.recipe);

    /* RENDER SUCCESS MESSAGE */
    addRecipeView.renderSuccessMessage();

    /* RENDER BOOKMARK VIEW */
    bookmarksView.render(model.state.bookmarks);

    /* CHANGE ID IN THE URL */
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    /* CLOSE FORM WINDOW */
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_DURATION * 1000);
  } catch (error) {
    addRecipeView.renderError(error.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
