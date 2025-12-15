// src/components/card/card.js
import { BaseComponent } from "../../common/base-component.js";
import "../ui/icon-button/icon-button.js";

const styles = `
  :host {
    display: block;
    box-sizing: border-box;
  }

  .card {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
    cursor: pointer;
  }

  .card__image {
    background: #B8B8B8;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    width: 100%;
    overflow: hidden;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    position: relative;
  }

  .card__image img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    background: #e0e0e0;
    transition: transform 0.2s;
  }

  .card__image img:active,
  .card__image img:focus {
    transform: scale(1.03);
  }

  .card__info {
    display: flex;
    flex-direction: column;
    background: var(--black, #000);
    color: var(--white, #fff);
    padding: 10px;
    min-height: 150px;
  }

  .card__tag {
    font-weight: 300;
    font-size: 11px;
    line-height: 15px;
    margin-bottom: 3px;
    opacity: 0.8;
  }

  .card__name {
    font-weight: 600;
    font-size: 15px;
    line-height: 110%;
    margin-bottom: 8px;
  }

  .card__author {
    font-weight: 400;
    font-size: 11px;
    line-height: 15px;
    opacity: 0.9;
  }

  .card__footer {
    margin-top: auto;
    display: flex;
    padding-top: 10px;
    gap: 8px;
    align-items: center;
  }
`;

export class CardComponent extends BaseComponent {
  #data = {};
  #filmData = {};

  static get observedAttributes() {
    return ["film-data", "is-favorite"];
  }

  constructor() {
    super();
    this.#data = {
      id: "",
      title: "",
      year: "",
      type: "",
      poster: "",
      isFavorite: false,
    };
  }

  get filmData() {
    return this.#filmData;
  }

  set filmData(value) {
    this.#filmData = value;
    this.#data.imdbID = value.imdbID || "";
    this.#data.Title = value.Title || "";
    this.#data.Year = value.Year || "";
    this.#data.Type = value.Type || "";
    this.#data.Poster = value.Poster || "";
    this.#data.isFavorite = value.isFavorite || false;
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "film-data":
        try {
          const parsed =
            typeof newValue === "string" && newValue.trim() !== ""
              ? JSON.parse(newValue)
              : newValue;

          if (parsed) this.filmData = parsed;
        } catch (err) {
          console.warn("card-component: invalid film-data attribute", err);
        }
        break;
      case "is-favorite":
        this.#data.isFavorite = this.hasAttribute("is-favorite");
        this.#updateFavoriteButton();
        break;
    }
  }

  #updateFavoriteButton() {
    const button = this._root.querySelector("icon-button");
    if (!button) return;

    const ariaLabel = this.#data.isFavorite
      ? "Remove from favorites"
      : "Add to favorites";
    const iconSrc = this.#data.isFavorite
      ? "/static/favorite.svg"
      : "/static/favorite-white.svg";

    if (this.#data.isFavorite) button.setAttribute("active", "");
    else button.removeAttribute("active");

    button.setAttribute("aria-label", ariaLabel);
    button.setAttribute(
      "aria-pressed",
      this.#data.isFavorite ? "true" : "false"
    );

    const img = this._root.querySelector("icon-button > img");
    if (img) {
      img.src = iconSrc;
      img.alt = ariaLabel;
    }
  }

  render() {
    this._root.innerHTML = "";
    this._root.appendChild(this.adoptGlobalStyles());
    this._root.appendChild(this.createStyle(styles));

    const template = document.createElement("template");
    template.innerHTML = `
      <div class="card">
        <div class="card__image">
          <img src="${this.#data.Poster}" alt="Book cover" loading="lazy" />
        </div>
        <div class="card__info">
          <div class="card__tag">${this.#data.Year || "Unknown"}</div>
          <div class="card__name">${this.#data.Title || "Untitled"}</div>
          <div class="card__author">${this.#data.Type || "Unknown author"}</div>
          <div class="card__footer">
            <icon-button
              ${this.#data.isFavorite ? "active" : ""}
              aria-label="${
                this.#data.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }"
              aria-pressed="${this.#data.isFavorite ? "true" : "false"}">
              <img src="${
                this.#data.isFavorite
                  ? "/static/favorite.svg"
                  : "/static/favorite-white.svg"
              }" 
                   alt="${
                     this.#data.isFavorite
                       ? "Remove from favorites"
                       : "Add to favorites"
                   }" />
            </icon-button>
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    `;

    this._root.appendChild(template.content.cloneNode(true));

    this.#attachEventListeners();
  }

  #attachEventListeners() {
    const button = this._root.querySelector("icon-button");
    if (!button) return;

    button.addEventListener("click", this.#handleFavoriteToggle);

    this.addEventListener("click", this.#handleOpenFilm);

    const img = this._root.querySelector(".card__image img");

    if (!img) return;

    img.addEventListener(
      "error",
      () => {
        img.src = "/static/placeholder.png";
      },
      { once: true }
    );
  }

  #handleFavoriteToggle = (e) => {
    e.stopPropagation();

    const newState = !this.#data.isFavorite;

    this.#data.isFavorite = newState;
    this.#updateFavoriteButton();

    this.emit("favorite-toggle", {
      film: { ...this.#filmData },
      isFavorite: newState,
    });
  };

  #handleOpenFilm = (e) => {
    const path = e.composedPath ? e.composedPath() : [];
    if (path.some((el) => el && el.tagName === "ICON-BUTTON")) return;

    this.emit("open-film", { imdbID: this.#data.imdbID });
  };

  disconnectedCallback() {
    const button = this._root?.querySelector?.("icon-button");

    if (button) button.removeEventListener("click", this.#handleFavoriteToggle);
    this.removeEventListener("click", this.#handleOpenFilm);
    if (super.disconnectedCallback) super.disconnectedCallback();
  }
}

customElements.define("card-component", CardComponent);
