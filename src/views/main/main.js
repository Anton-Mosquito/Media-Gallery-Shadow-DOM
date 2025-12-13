import { AbstractView } from "../../common/view";
import onChange from "on-change";
import { eventBus } from "../../common/event-bus";
import { filmService } from "../../common/film-service.js";
import { FavoritesService } from "../../common/favorites-service";

import "../../components/header/header.js";
import "../../components/search/search.js";
import "../../components/card-list/card-list.js";
import "../../components/card/card.js";

export class MainView extends AbstractView {
  #state = null;
  #elements = {
    header: null,
    resultsHeader: null,
    cardList: null,
  };

  constructor(appState) {
    super();
    this.appState = appState;
    this.appState = onChange(this.appState, this.#appStateHook);

    const initialState = {
      list: [],
      searchQuery: undefined,
      page: 1,
      totalResults: 0,
    };

    this.#state = onChange(initialState, this.#stateHook);
    this.setTitle("Search films");

    this.#setupEventListeners();
  }

  #setupEventListeners() {
    eventBus.on("search", this.#handleSearch);
    eventBus.on("favorite-toggle", this.#handleFavoriteToggle);
    eventBus.on("open-film", this.#handleOpenFilm);
  }

  destroy() {
    onChange.unsubscribe(this.appState);
    onChange.unsubscribe(this.#state);
    eventBus.off("search", this.#handleSearch);
    eventBus.off("favorite-toggle", this.#handleFavoriteToggle);
    eventBus.off("open-film", this.#handleOpenFilm);
  }

  #handleSearch = ({ query }) => {
    console.trace("🚀 ~ MainView ~ query:", query);
    // If the incoming query equals current, still trigger a fresh fetch
    if (query === this.#state.searchQuery) {
      this.#state.page = 1;
      this.#state.list = [];
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

  #appStateHook = (path) => {
    if (path !== "favorites") return;

    this.#updateHeader();
  };

  async #retrieveFilms() {
    this.#setAttributeOnElement(this.#elements.cardList, "loading", true);

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
      this.#setAttributeOnElement(this.#elements.cardList, "loading", false);
    }
  }

  #stateHook = (path) => {
    if (path === "searchQuery") {
      this.#retrieveFilms();
    }

    if (path === "list") {
      this.#updateResultsCount();
      this.#updateCardList();
    }
  };

  render() {
    const main = document.createElement("main");

    this.#elements.resultsHeader = document.createElement("h1");
    this.#elements.resultsHeader.textContent = this.#state.totalResults
      ? `Books found – ${this.#state.totalResults}`
      : "Enter a query to search";

    main.appendChild(this.#elements.resultsHeader);

    const searchComponent = document.createElement("search-component");
    this.#setAttributeOnElement(
      searchComponent,
      "query",
      this.#state.searchQuery || ""
    );
    main.appendChild(searchComponent);

    this.#elements.cardList = document.createElement("card-list-component");
    this.#setAttributeOnElement(
      this.#elements.cardList,
      "loading",
      this.#state.loading
    );
    main.appendChild(this.#elements.cardList);

    this.app.innerHTML = "";
    this.app.appendChild(main);

    this.#renderHeader();
    this.#updateCardList();
  }

  #renderHeader() {
    this.#elements.header = document.createElement("header-component");

    this.#updateHeader();

    this.app.prepend(this.#elements.header);
  }

  #updateHeader() {
    if (!this.#elements.header) return;

    this.#setAttributeOnElement(
      this.#elements.header,
      "favorites-count",
      this.appState.favorites.length
    );
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

  #setAttributeOnElement(element, attrName, value) {
    if (!element) return;

    element.setAttribute(attrName, String(value));
  }
}
