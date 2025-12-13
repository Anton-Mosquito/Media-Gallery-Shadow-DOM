import { AbstractView } from "../../common/view";
import { filmService } from "../../common/film-service.js";
import { eventBus } from "../../common/event-bus";
import { EVENTS } from "../../common/constants.js";
import { FavoritesService } from "../../common/favorites-service";
import onChange from "on-change";
import "../../components/header/header.js";
import "../../components/ui/loader/loader.js";
import "../../components/film-detail/film-details.js";

export class DetailView extends AbstractView {
  #elements = {
    header: null,
    detailsInfo: null,
    loader: null,
  };

  constructor(appState) {
    super();
    this.appState = onChange(appState, this.#appStateHook);
    this.setTitle("Film details");
    this.#setupEventListeners();
  }

  destroy() {
    onChange.unsubscribe(this.appState);
    eventBus.off(EVENTS.FAVORITE_TOGGLE, this.#handleFavoriteToggle);
  }

  async render() {
    const favoritesCount = this.appState.favorites.length;

    this.app.innerHTML = `
      <header-component favorites-count="${favoritesCount}"></header-component>
      <main class="detail-view">
        <style>
          .detail-view {
            display: block;
            box-sizing: border-box;
            padding: 30px 20px;
            background: var(--page-bg, #fff);
            color: var(--text-color, #111);
          }
          .detail {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          [data-page-loader] {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.75);
            z-index: 9999;
          }
        </style>
        <div class="detail">
          <film-details></film-details>
        </div>
      </main>
      <div data-page-loader>
        <loader-component big></loader-component>
      </div>
    `;

    this.#elements.header = this.app.querySelector("header-component");
    this.#elements.detailsInfo = this.app.querySelector("film-details");
    this.#elements.loader = this.app.querySelector("[data-page-loader]");

    const imdbID = this.appState.selectedFilmId;
    if (!imdbID) {
      this.#elements.loader.remove();
      return;
    }
    await this.#loadFilmDetails(imdbID);
  }

  async #loadFilmDetails(imdbID) {
    try {
      const details = await filmService.getFilmById(imdbID);
      this.#updateDetailsInfo(details);
    } catch (err) {
      console.error("DetailView load error", err);
    } finally {
      if (this.#elements.loader) {
        this.#elements.loader.remove();
      }
    }
  }

  #updateDetailsInfo(details) {
    const isFavorite = this.appState.favorites.some(
      (f) => f.imdbID === details.imdbID || f.id === details.imdbID
    );
    this.#elements.detailsInfo.setDetails({ details, isFavorite });
  }

  #setupEventListeners() {
    eventBus.on(EVENTS.FAVORITE_TOGGLE, this.#handleFavoriteToggle);
  }

  #handleFavoriteToggle = ({ film, isFavorite }) => {
    FavoritesService.toggle(this.appState, film, isFavorite);
  };

  #appStateHook = (path) => {
    if (path === "favorites") {
      this.#updateHeader();
      this.#updateButtonState();
    }
  };

  #updateHeader() {
    if (this.#elements.header) {
      this.#elements.header.setAttribute(
        "favorites-count",
        String(this.appState.favorites.length)
      );
    }
  }

  #updateButtonState() {
    if (!this.#elements.detailsInfo) return;

    const isFavorite = this.appState.favorites.some(
      ({ imdbID }) => imdbID === this.appState.selectedFilmId
    );

    this.#elements.detailsInfo.setAttribute("is-favorite", String(isFavorite));
  }
}
