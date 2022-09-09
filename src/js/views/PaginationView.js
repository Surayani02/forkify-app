'use strict';

import icons from "../../img/icons.svg";

import View from "./View";

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');

    addHandlerClick(handler) {
        this._parentElement.addEventListener('click', function (event) {
            const btn = event.target.closest('.btn--inline');
            if (!btn) return;
            const goToPage = +(btn.dataset.goto);
            handler(goToPage);
        });
    }

    _generateMarkup() {
        const currentPage = this._data.page;

        const numberOfPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);

        // Page 1 with other pages
        if (currentPage === 1 && numberOfPages > 1) return `
            <button data-goto="${currentPage + 1}" class="btn--inline pagination__btn--next">
                <span>Page ${currentPage + 1}</span>
                <svg class="search__icon">
                  <use href="${icons}#icon-arrow-right"></use>
                </svg>
            </button>
        `;

        // Last page
        if (currentPage === numberOfPages && numberOfPages > 1) return `
            <button data-goto="${currentPage - 1}" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                  <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${currentPage - 1}</span>
            </button>
        `;

        // Other pages
        if (currentPage < numberOfPages) return `
            <button data-goto="${currentPage - 1}" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                  <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${currentPage - 1}</span>
            </button>
            <button data-goto="${currentPage + 1}" class="btn--inline pagination__btn--next">
                <span>Page ${currentPage + 1}</span>
                <svg class="search__icon">
                  <use href="${icons}#icon-arrow-right"></use>
                </svg>
            </button>
        `;

        // Page 1 with no other pages
        return '';
    }
}

export default new PaginationView();