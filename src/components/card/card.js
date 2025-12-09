// src/components/card/card.js
import { BaseComponent } from "../../common/base-component.js";

const styles = `
  :host {
    display: block;
  }

  .card {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
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
  }

  .button__add {
    border-radius: 6px;
    width: 36px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 1px solid var(--white, #fff);
    cursor: pointer;
    transition: all 0.2s;
  }

  .button__add:hover {
    transform: scale(1.05);
  }

  .button__active {
    background: var(--white, #fff);
  }
    
  .button__add img {
    display: block;
    width: 18px;
    height: 18px;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  /* Slot styling */
  ::slotted([slot="actions"]) {
    margin-left: 8px;
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
    this.#data.id = value.imdbID || "";
    this.#data.title = value.Title || "";
    this.#data.year = value.Year || "";
    this.#data.type = value.Type || "";
    this.#data.poster = value.Poster || "";
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
        this.#updateButton();
        break;
    }
  }

  #updateButton() {
    const button = this._root.querySelector(".button__add");
    if (!button) return;

    if (this.#data.isFavorite) {
      button.classList.add("button__active");
      button.innerHTML =
        '<img src="/static/favorite.svg" alt="Remove from favorites" />';
    } else {
      button.classList.remove("button__active");
      button.innerHTML =
        '<img src="/static/favorite-white.svg" alt="Add to favorites" />';
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
          <img src="${this.#data.poster}" alt="Book cover" loading="lazy" />
        </div>
        <div class="card__info">
          <div class="card__tag">${this.#data.year || "Unknown"}</div>
          <div class="card__name">${this.#data.title || "Untitled"}</div>
          <div class="card__author">${this.#data.type || "Unknown author"}</div>
          <div class="card__footer">
            <button class="button__add ${
              this.#data.isFavorite ? "button__active" : ""
            }"
                    aria-label="${
                      this.#data.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }"
                    aria-pressed="${this.#data.isFavorite ? "true" : "false"}">
              ${this.#renderFavoriteButton()}
            </button>
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    `;

    this._root.appendChild(template.content.cloneNode(true));

    this.#attachEventListeners();
  }

  #attachEventListeners() {
    const button = this._root.querySelector(".button__add");
    if (!button) return;

    button.addEventListener("click", this.#handleFavoriteToggle);

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

  #handleFavoriteToggle = () => {
    const newState = !this.#data.isFavorite;

    this.#data.isFavorite = newState;
    this.#updateButton();

    this.emit("favorite-toggle", {
      film: {
        id: this.#data.id,
        title: this.#data.title,
        type: this.#data.type,
        poster: this.#data.poster,
        year: this.#data.year,
      },
      isFavorite: newState,
    });
  };

  disconnectedCallback() {
    const button = this._root?.querySelector?.(".button__add");

    if (button) button.removeEventListener("click", this.#handleFavoriteToggle);
    if (super.disconnectedCallback) super.disconnectedCallback();
  }

  #renderFavoriteButton() {
    const src = this.#data.isFavorite
      ? "/static/favorite.svg"
      : "/static/favorite-white.svg";
    const alt = this.#data.isFavorite
      ? "Remove from favorites"
      : "Add to favorites";
    return `<img src="${src}" alt="${alt}" />`;
  }
}

customElements.define("card-component", CardComponent);
