import { AbstractView } from "../../common/view";
import onChange from "on-change";
import { eventBus } from "../../common/event-bus";

import "../../components/header/header.js";
import "../../components/search/search.js";
import "../../components/card-list/card-list.js";
import "../../components/card/card.js";

export class MainView extends AbstractView {
  state = {
    list: [],
    loading: false,
    searchQuery: undefined,
    offset: 0,
    numFound: 0,
  };

  constructor(appState) {
    super();
    this.appState = appState;
    this.appState = onChange(this.appState, this.appStateHook.bind(this));
    this.state = onChange(this.state, this.stateHook.bind(this));
    this.setTitle("Search books");

    this.setupEventListeners();
  }

  setupEventListeners() {
    eventBus.on("search", this.handleSearch.bind(this));
    eventBus.on("favorite-toggle", this.handleFavoriteToggle.bind(this));
  }

  handleSearch({ query }) {
    console.log("Search initiated:", query);
    this.state.searchQuery = query;
    this.state.offset = 0;
    this.state.list = [];
  }

  handleFavoriteToggle({ book, isFavorite }) {
    console.log("Favorite toggle:", book.title, isFavorite);

    if (isFavorite) {
      const exists = this.appState.favorites.find((b) => b.key === book.key);
      if (!exists) {
        this.appState.favorites = [...this.appState.favorites, book];
      }
    } else {
      this.appState.favorites = this.appState.favorites.filter(
        (b) => b.key !== book.key
      );
    }
  }

  destroy() {
    onChange.unsubscribe(this.appState);
    onChange.unsubscribe(this.state);
    eventBus.off("search", this.handleSearch.bind(this));
    eventBus.off("favorite-toggle", this.handleFavoriteToggle.bind(this));
  }

  appStateHook(path) {
    if (path !== "favorites") return;

    console.log("Favorites updated:", this.appState.favorites.length);
    this.updateHeader();
    this.updateCardList();
  }

  async loadList(query, offset = 0) {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${query}&offset=${offset}&limit=10`
    );
    return response.json();
  }

  async stateHook(path) {
    if (path === "searchQuery") {
      this.state.loading = true;
      this.updateCardListLoading();

      try {
        const data = await this.loadList(
          this.state.searchQuery,
          this.state.offset
        );
        this.state.numFound = data.numFound;
        this.state.list = [...this.state.list, ...data.docs];
        this.state.loading = false;
      } catch (error) {
        console.error("Error loading books:", error);
        this.state.loading = false;
      }
    }

    if (path === "list" || path === "loading") {
      this.updateCardList();
      this.updateResultsCount();
    }
  }

  render() {
    const main = document.createElement("main");

    const resultsHeader = document.createElement("h1");
    resultsHeader.id = "results-header";
    resultsHeader.textContent = this.state.numFound
      ? `Books found – ${this.state.numFound}`
      : "Enter a query to search";

    main.appendChild(resultsHeader);

    const searchComponent = document.createElement("search-component");
    searchComponent.query = this.state.searchQuery || "";
    main.appendChild(searchComponent);

    const cardList = document.createElement("card-list-component");
    cardList.id = "card-list";
    cardList.loading = this.state.loading;
    main.appendChild(cardList);

    this.app.innerHTML = "";
    this.app.appendChild(main);

    this.renderHeader();
    this.updateCardList();
  }

  renderHeader() {
    const header = document.createElement("header-component");
    header.id = "main-header";
    header.favoritesCount = this.appState.favorites.length;
    this.app.prepend(header);
  }

  updateHeader() {
    const header = this.app.querySelector("#main-header");
    if (header) {
      header.favoritesCount = this.appState.favorites.length;
    }
  }

  updateResultsCount() {
    const resultsHeader = this.app.querySelector("#results-header");
    if (resultsHeader) {
      resultsHeader.textContent = this.state.numFound
        ? `Books found – ${this.state.numFound}`
        : "Enter a query to search";
    }
  }

  updateCardList() {
    const cardList = this.app.querySelector("#card-list");
    if (!cardList) return;

    cardList.loading = this.state.loading;

    const booksWithFavorites = this.state.list.map((book) => ({
      ...book,
      isFavorite: this.appState.favorites.some((f) => f.key === book.key),
    }));

    cardList.setCards(booksWithFavorites);
  }

  updateCardListLoading() {
    const cardList = this.app.querySelector("#card-list");
    if (cardList) {
      cardList.loading = true;
    }
  }
}
