// src/views/favorites/favorites.js
import { AbstractView } from "../../common/view.js";
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
    super(appState);
    this.setTitle("My Favorites books");
    this.subscribe(EVENTS.FAVORITE_TOGGLE, this.#handleFavoriteToggle);
  }

  #handleFavoriteToggle = ({ film, isFavorite }) => {
    if (isFavorite) return;

    FavoritesService.remove(this.appState, film);
  };

  render() {
    const main = document.createElement("main");

    const title = document.createElement("h1");
    title.textContent = "Favorites";
    main.appendChild(title);

    this.#elements.cardList = document.createElement("card-list-component");
    main.appendChild(this.#elements.cardList);

    this.renderWithHeader(main);

    this.#updateCardList();
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
