// src/views/favorites/favorites.js
import { AbstractView } from "../../common/view.js";
import onChange from "on-change";
import { eventBus } from "../../common/event-bus.js";
import { FavoritesService } from "../../common/favorites-service.js";

import "../../components/header/header.js";
import "../../components/card-list/card-list.js";
import "../../components/card/card.js";

export class FavoritesView extends AbstractView {
  #elements = {
    header: null,
    cardList: null,
  };

  constructor(appState) {
    super();
    this.appState = appState;
    this.appState = onChange(this.appState, this.appStateHook.bind(this));
    this.setTitle("My Favorites books");

    this.setupEventListeners();
  }

  setupEventListeners() {
    eventBus.on("favorite-toggle", this.handleFavoriteToggle.bind(this));
  }

  handleFavoriteToggle({ book, isFavorite }) {
    if (!isFavorite) {
      FavoritesService.remove(this.appState, book);
    }
  }

  destroy() {
    onChange.unsubscribe(this.appState);
    eventBus.off("favorite-toggle", this.handleFavoriteToggle.bind(this));
  }

  appStateHook(path) {
    if (path === "favorites") {
      this.updateCardList();
      this.updateHeader();
    }
  }

  render() {
    const main = document.createElement("div");

    const title = document.createElement("h1");
    title.textContent = "Favorites";
    main.appendChild(title);

    this.#elements.cardList = document.createElement("card-list-component");
    this.#elements.cardList.id = "favorites-list";
    main.appendChild(this.#elements.cardList);

    this.app.innerHTML = "";
    this.app.appendChild(main);

    this.renderHeader();
    this.updateCardList();
  }

  renderHeader() {
    this.#elements.header = document.createElement("header-component");
    this.#elements.header.id = "favorites-header";
    this.#elements.header.favoritesCount = this.appState.favorites.length;
    this.app.prepend(this.#elements.header);
  }

  updateHeader() {
    if (this.#elements.header) {
      this.#elements.header.favoritesCount = this.appState.favorites.length;
    }
  }

  updateCardList() {
    if (this.#elements.cardList) {
      const favoritesWithFlag = this.appState.favorites.map((book) => ({
        ...book,
        isFavorite: true,
      }));
      this.#elements.cardList.setCards(favoritesWithFlag);
    }
  }
}
