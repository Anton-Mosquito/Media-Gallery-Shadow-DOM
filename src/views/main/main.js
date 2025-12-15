import { AbstractView } from "../../common/view";
import { EVENTS } from "../../common/constants.js";
import { filmService } from "../../common/film-service.js";
import { FavoritesService } from "../../common/favorites-service";

import "../../components/header/header.js";
import "../../components/search/search.js";
import "../../components/card-list/card-list.js";
import "../../components/card/card.js";
import "../../components/ui/pagination/pagination.js";

export class MainView extends AbstractView {
  #state = null;
  #elements = {
    header: null,
    resultsHeader: null,
    cardList: null,
    pagination: null,
  };

  constructor(appState) {
    super(appState);

    this.#state = this.initLocalState(
      {
        list: [],
        searchQuery: undefined,
        page: 1,
        totalResults: 0,
      },
      this.#stateHook
    );

    this.setTitle("Search films");

    this.subscribe(EVENTS.SEARCH, this.#handleSearch);
    this.subscribe(EVENTS.FAVORITE_TOGGLE, this.#handleFavoriteToggle);
    this.subscribe(EVENTS.OPEN_FILM, this.#handleOpenFilm);
    this.subscribe(EVENTS.PAGE_CHANGE, this.#handlePageChange);
  }

  #handleSearch = ({ query }) => {
    if (query === this.#state.searchQuery) {
      this.#retrieveFilms();
      return;
    }

    this.#state.searchQuery = query;
    this.#state.page = 1;
    this.#state.list = [];
  };

  #handleFavoriteToggle = ({ film, isFavorite }) => {
    FavoritesService.toggle(this.appState, film, isFavorite);
  };

  #handleOpenFilm = ({ imdbID }) => {
    if (!imdbID) return;
    this.appState.selectedFilmId = imdbID;
    window.location.hash = "#detail";
  };

  #handlePageChange = ({ page }) => {
    if (page === this.#state.page) return;
    this.#state.page = page;
    this.#state.list = [];
  };

  async #retrieveFilms() {
    this.setAttribute(this.#elements.cardList, "loading", true);

    try {
      const data = await filmService.searchFilms(
        this.#state.searchQuery,
        this.#state.page
      );
      const { Search = [], totalResults = 0 } = data;

      this.#state.totalResults = totalResults;
      this.#state.list = [...this.#state.list, ...Search];
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      this.setAttribute(this.#elements.cardList, "loading", false);
    }
  }

  #stateHook = (path) => {
    if (path === "searchQuery" || path === "page") {
      this.#retrieveFilms();
    }

    if (path === "list") {
      this.#updateResultsCount();
      this.#updateCardList();
    }

    if (path === "totalResults" || path === "page") {
      this.#updatePagination();
    }
  };

  render() {
    const main = document.createElement("main");
    main.classList.add("main-view");

    this.#elements.resultsHeader = document.createElement("h1");
    this.#elements.resultsHeader.textContent = this.#state.totalResults
      ? `Books found – ${this.#state.totalResults}`
      : "Enter a query to search";

    main.appendChild(this.#elements.resultsHeader);

    const searchComponent = document.createElement("search-component");
    this.setAttribute(searchComponent, "query", this.#state.searchQuery || "");
    main.appendChild(searchComponent);

    this.#elements.cardList = document.createElement("card-list-component");
    this.setAttribute(this.#elements.cardList, "loading", this.#state.loading);
    main.appendChild(this.#elements.cardList);

    this.#elements.pagination = document.createElement("pagination-component");
    this.#elements.pagination.addEventListener("page-change", (e) => {
      this.#handlePageChange(e.detail);
    });
    main.appendChild(this.#elements.pagination);

    this.renderWithHeader(main);

    this.#updateCardList();
    this.#updatePagination();
  }

  #updateResultsCount() {
    if (!this.#elements.resultsHeader) return;

    this.#elements.resultsHeader.textContent = this.#state.totalResults
      ? `Films found – ${this.#state.totalResults}`
      : "Enter a query to search";
  }

  #updateCardList() {
    if (!this.#elements.cardList) return;

    const filmsWithFavorites = this.#state.list.map((film) => ({
      ...film,
      isFavorite: this.appState.favorites.some(({ id }) => id === film.imdbID),
    }));

    this.#elements.cardList.setCards(filmsWithFavorites);
  }

  #updatePagination() {
    if (!this.#elements.pagination) return;

    const totalPages = Math.ceil(this.#state.totalResults / 10);

    this.setAttribute(
      this.#elements.pagination,
      "current-page",
      this.#state.page
    );
    this.setAttribute(this.#elements.pagination, "total-pages", totalPages);

    this.#elements.pagination.style.display =
      totalPages <= 1 ? "none" : "block";
  }
}
