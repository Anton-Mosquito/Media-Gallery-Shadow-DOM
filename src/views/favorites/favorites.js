// src/views/favorites/favorites.js
import { AbstractView } from "../../common/view.js";
import onChange from "on-change";
import { eventBus } from "../../common/event-bus.js";

import "../../components/header/header.js";
import "../../components/card-list/card-list.js";
import "../../components/card/card.js";

export class FavoritesView extends AbstractView {
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
      this.appState.favorites = this.appState.favorites.filter(
        (b) => b.key !== book.key
      );
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

    const cardList = document.createElement("card-list-component");
    cardList.id = "favorites-list";
    main.appendChild(cardList);

    this.app.innerHTML = "";
    this.app.appendChild(main);

    this.renderHeader();
    this.updateCardList();
  }

  renderHeader() {
    const header = document.createElement("header-component");
    header.id = "favorites-header";
    header.favoritesCount = this.appState.favorites.length;
    this.app.prepend(header);
  }

  updateHeader() {
    const header = this.app.querySelector("#favorites-header");
    if (header) {
      header.favoritesCount = this.appState.favorites.length;
    }
  }

  updateCardList() {
    const cardList = this.app.querySelector("#favorites-list");
    if (cardList) {
      const favoritesWithFlag = this.appState.favorites.map((book) => ({
        ...book,
        isFavorite: true,
      }));
      cardList.setCards(favoritesWithFlag);
    }
  }
}
