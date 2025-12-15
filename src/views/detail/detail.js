import { AbstractView } from "../../common/view";
import { filmService } from "../../common/film-service.js";
import { EVENTS } from "../../common/constants.js";
import { FavoritesService } from "../../common/favorites-service";
import "../../components/header/header.js";
import "../../components/ui/loader/loader.js";
import "../../components/film-detail/film-details.js";

export class DetailView extends AbstractView {
  #elements = {
    detailsInfo: null,
    loader: null,
  };

  constructor(appState) {
    super(appState);
    this.setTitle("Film details");
    this.subscribe(EVENTS.FAVORITE_TOGGLE, this.#handleFavoriteToggle);
  }

  async render() {
    const main = document.createElement("main");
    main.classList.add("detail-view");

    const style = document.createElement("style");
    style.textContent = `
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
    `;
    main.appendChild(style);

    const detailContainer = document.createElement("div");
    detailContainer.classList.add("detail");

    this.#elements.detailsInfo = document.createElement("film-details");
    detailContainer.appendChild(this.#elements.detailsInfo);

    main.appendChild(detailContainer);

    this.#elements.loader = document.createElement("div");
    this.#elements.loader.setAttribute("data-page-loader", "");
    const loaderComponent = document.createElement("loader-component");
    loaderComponent.setAttribute("big", "");
    this.#elements.loader.appendChild(loaderComponent);
    main.appendChild(this.#elements.loader);

    this.renderWithHeader(main);

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

  #handleFavoriteToggle = ({ film, isFavorite }) => {
    FavoritesService.toggle(this.appState, film, isFavorite);
  };

  onAppStateChange(path) {
    super.onAppStateChange(path);

    if (path === "favorites") {
      this.#updateButtonState();
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
