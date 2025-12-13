// src/views/favorites/favorites.js
import { AbstractView } from "../../common/view.js";
import onChange from "on-change";
import { eventBus } from "../../common/event-bus.js";
import { EVENTS } from "../../common/constants.js";
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
    this.appState = onChange(this.appState, this.#appStateHook);
    this.setTitle("My Favorites books");

    this.#setupEventListeners();
  }

  #setupEventListeners() {
    eventBus.on(EVENTS.FAVORITE_TOGGLE, this.#handleFavoriteToggle);
  }

  #handleFavoriteToggle = ({ film, isFavorite }) => {
    if (isFavorite) return;

    FavoritesService.remove(this.appState, film);
  };

  destroy() {
    onChange.unsubscribe(this.appState);
    eventBus.off(EVENTS.FAVORITE_TOGGLE, this.#handleFavoriteToggle);
  }

  #appStateHook = (path) => {
    if (path !== "favorites") return;

    this.#updateCardList();
    this.#updateHeader();
  };

  render() {
    const main = document.createElement("main");

    const title = document.createElement("h1");
    title.textContent = "Favorites";
    main.appendChild(title);

    this.#elements.cardList = document.createElement("card-list-component");
    main.appendChild(this.#elements.cardList);

    this.app.innerHTML = "";
    this.app.appendChild(main);

    this.#renderHeader();
    this.#updateCardList();
  }

  #renderHeader() {
    this.#elements.header = document.createElement("header-component");

    this.#elements.header.setAttribute(
      "favorites-count",
      String(this.appState.favorites.length)
    );

    this.app.prepend(this.#elements.header);
  }

  #updateHeader() {
    if (!this.#elements.header) return;

    this.#elements.header.setAttribute(
      "favorites-count",
      String(this.appState.favorites.length)
    );
  }

  #updateCardList() {
    if (!this.#elements.cardList) return;

    const favoritesWithFlag = this.appState.favorites.map((film) => ({
      ...film,
      isFavorite: true,
    }));

    this.#elements.cardList.setCards(favoritesWithFlag);
  }
}
