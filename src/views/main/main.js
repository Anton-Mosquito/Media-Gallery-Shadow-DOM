import { AbstractView } from "../../common/view";
import onChange from "on-change";
import { eventBus } from "../../common/event-bus";
import { bookService } from "../../common/book-service";
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

  get state() {
    return this.#state;
  }

  constructor(appState) {
    super();
    this.handleSearch = this.handleSearch.bind(this);
    this.handleFavoriteToggle = this.handleFavoriteToggle.bind(this);
    this.appState = appState;
    this.appState = onChange(this.appState, this.appStateHook.bind(this));

    const initialState = {
      list: [],
      searchQuery: undefined,
      offset: 0,
      numFound: 0,
    };

    this.#state = onChange(initialState, this.stateHook.bind(this));
    this.setTitle("Search books");

    this.setupEventListeners();
  }

  setupEventListeners() {
    eventBus.on("search", this.handleSearch);
    eventBus.on("favorite-toggle", this.handleFavoriteToggle);
  }

  handleSearch({ query }) {
    this.state.searchQuery = query;
    this.state.offset = 0;
    this.state.list = [];
  }

  handleFavoriteToggle({ book, isFavorite }) {
    FavoritesService.toggle(this.appState, book, isFavorite);
  }

  destroy() {
    onChange.unsubscribe(this.appState);
    onChange.unsubscribe(this.state);
    eventBus.off("search", this.handleSearch);
    eventBus.off("favorite-toggle", this.handleFavoriteToggle);
  }

  appStateHook(path) {
    if (path !== "favorites") return;

    this.updateHeader();
    this.updateCardList();
  }

  async loadBooks() {
    this.setCardListLoading(true);

    try {
      const data = await bookService.searchBooks(
        this.state.searchQuery,
        this.state.offset
      );

      this.state.numFound = data.numFound;
      this.state.list = [...this.state.list, ...data.docs];
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      this.setCardListLoading(false);
    }
  }

  stateHook(path) {
    if (path === "searchQuery") {
      this.loadBooks();
    }

    if (path === "list") {
      this.updateResultsCount();
      this.updateCardList();
    }
  }

  render() {
    const main = document.createElement("main");

    this.#elements.resultsHeader = document.createElement("h1");
    this.#elements.resultsHeader.id = "results-header";
    this.#elements.resultsHeader.textContent = this.state.numFound
      ? `Books found – ${this.state.numFound}`
      : "Enter a query to search";

    main.appendChild(this.#elements.resultsHeader);

    const searchComponent = document.createElement("search-component");
    searchComponent.query = this.state.searchQuery || "";
    main.appendChild(searchComponent);

    this.#elements.cardList = document.createElement("card-list-component");
    this.#elements.cardList.id = "card-list";
    this.#elements.cardList.loading = this.state.loading;
    main.appendChild(this.#elements.cardList);

    this.app.innerHTML = "";
    this.app.appendChild(main);

    this.renderHeader();
    this.updateCardList();
  }

  renderHeader() {
    this.#elements.header = document.createElement("header-component");
    this.#elements.header.id = "main-header";
    this.#elements.header.favoritesCount = this.appState.favorites.length;
    this.app.prepend(this.#elements.header);
  }

  updateHeader() {
    if (!this.#elements.header) return;

    this.#elements.header.favoritesCount = this.appState.favorites.length;
  }

  updateResultsCount() {
    if (!this.#elements.resultsHeader) return;

    this.#elements.resultsHeader.textContent = this.state.numFound
      ? `Books found – ${this.state.numFound}`
      : "Enter a query to search";
  }

  updateCardList() {
    if (!this.#elements.cardList) return;

    const booksWithFavorites = this.state.list.map((book) => ({
      ...book,
      isFavorite: this.appState.favorites.some((f) => f.key === book.key),
    }));

    this.#elements.cardList.setCards(booksWithFavorites);
  }

  setCardListLoading(flag) {
    if (!this.#elements.cardList) return;

    this.#elements.cardList.loading = flag;
  }
}
