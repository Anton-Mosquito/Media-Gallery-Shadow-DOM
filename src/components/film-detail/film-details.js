import { BaseComponent } from "../../common/base-component.js";
import "../detail-row/detail-row.js";

const CONSTANTS = {
  PLACEHOLDER: {
    IMAGE: "/static/placeholder.png",
    TEXT: "-",
    LOADING: "Loading...",
    TITLE: "Untitled",
    EMPTY: "&nbsp;",
  },
  NO_DATA: "N/A",
  LABELS: {
    ADD_TO_FAVORITES: "Add to favorites",
    REMOVE_FROM_FAVORITES: "Remove from favorites",
  },
};

const styles = `
:host {
  display: block;
}
.wrapper {
  display: flex;
  gap: 20px;
  flex-direction: column;
}
.container {
  display: flex;
  gap: 40px;
}
.poster {
  width: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(2,6,23,0.06);
  flex-shrink: 0;
}
.poster img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  min-height: 300px; /* Prevent layout shift */
  background: #f0f0f0;
}
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
icon-button {
  background: var(--black, #000);
  color: var(--white, #fff);
  padding: 12px 22px;
  border-radius: 8px;
  font-weight: 600;
  width: 200px;
}
.title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color, #111);
}
.details-list {
  flex: .8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.details-list detail-row {
  display: grid;
  grid-template-columns: 85px auto;
  align-items: center;
}
`;

export class FilmDetailsInfo extends BaseComponent {
  #elements = {};
  #details = null;

  static get observedAttributes() {
    return ["is-favorite"];
  }

  constructor() {
    super();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "is-favorite") {
      this.#updateButtonState(newValue === "true");
    }
  }

  get isFavorite() {
    return this.getAttribute("is-favorite") === "true";
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.#cleanup();
  }

  /**
   * Main public method to update component state
   */
  setDetails({ details, isFavorite }) {
    if (!details) {
      console.warn("FilmDetailsInfo: No details provided");
      return;
    }

    this.#details = details;
    const filmData = this.#extractFilmData(details);

    // Update DOM elements directly instead of re-rendering HTML
    this.#updateView(filmData);
    this.#updateButtonState(isFavorite);
  }

  render() {
    const style = document.createElement("style");
    style.textContent = styles;

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const container = document.createElement("div");
    container.className = "container";

    // Poster
    const poster = document.createElement("div");
    poster.className = "poster";
    const img = document.createElement("img");
    img.id = "poster-img";
    img.src = CONSTANTS.PLACEHOLDER.IMAGE;
    img.alt = "Poster";
    poster.appendChild(img);

    // Content
    const content = document.createElement("div");
    content.className = "content";

    const title = document.createElement("h1");
    title.className = "title";
    title.id = "film-title";
    title.textContent = CONSTANTS.PLACEHOLDER.LOADING;

    const detailsList = document.createElement("div");
    detailsList.className = "details-list";

    const rows = [
      { id: "writer", label: "Writer :" },
      { id: "genre", label: "Category :" },
      { id: "actors", label: "Actors :" },
      { id: "rating", label: "Ratings :" },
      { id: "year", label: "Released" },
      { id: "runtime", label: "Minutes:" },
      { id: "director", label: "Director:" },
    ];

    rows.forEach(({ id, label }) => {
      const row = document.createElement("detail-row");
      row.dataset.id = id;
      row.setAttribute("label", label);
      detailsList.appendChild(row);
    });

    const button = document.createElement("icon-button");
    button.setAttribute("aria-label", CONSTANTS.LABELS.ADD_TO_FAVORITES);
    button.textContent = CONSTANTS.LABELS.ADD_TO_FAVORITES;

    content.append(title, detailsList, button);
    container.append(poster, content);

    const plotRow = document.createElement("detail-row");
    plotRow.dataset.id = "plot";
    plotRow.setAttribute("description", "");
    plotRow.setAttribute("label", "Description:");

    const tagsRow = document.createElement("detail-row");
    tagsRow.dataset.id = "tags";
    tagsRow.setAttribute("tags", "");
    tagsRow.setAttribute("label", "Tags:");

    wrapper.append(container, plotRow, tagsRow);

    this._root.replaceChildren(style, wrapper);

    this.#cacheElements();
    this.#attachEventListeners();
  }

  #cacheElements() {
    const $ = (selector) => this._root.querySelector(selector);

    this.#elements = {
      poster: $("#poster-img"),
      title: $("#film-title"),
      button: $("icon-button"),
      rows: {
        writer: $('[data-id="writer"]'),
        genre: $('[data-id="genre"]'),
        actors: $('[data-id="actors"]'),
        rating: $('[data-id="rating"]'),
        year: $('[data-id="year"]'),
        runtime: $('[data-id="runtime"]'),
        director: $('[data-id="director"]'),
        plot: $('[data-id="plot"]'),
        tags: $('[data-id="tags"]'),
      },
    };
  }

  #updateView(data) {
    const { poster, title, rows } = this.#elements;

    // Update simple elements
    if (poster) {
      poster.src = data.posterUrl;
      poster.alt = data.title;
    }

    if (title) {
      title.textContent = data.title;
    }

    // Update detail rows
    const mapping = {
      writer: data.writer,
      genre: data.genre,
      actors: data.actors,
      rating: data.rating,
      year: data.year,
      runtime: data.runtime,
      director: data.director,
      plot: data.plot,
      tags: data.tags,
    };

    Object.entries(mapping).forEach(([key, value]) => {
      if (rows[key]) {
        rows[key].setAttribute("value", value);
      }
    });
  }

  #updateButtonState(value) {
    const isFav = value === true || value === "true";
    const btn = this.#elements.button;

    if (!btn) return;

    const label = isFav
      ? CONSTANTS.LABELS.REMOVE_FROM_FAVORITES
      : CONSTANTS.LABELS.ADD_TO_FAVORITES;

    if (isFav) {
      btn.setAttribute("active", "");
    } else {
      btn.removeAttribute("active");
    }

    btn.setAttribute("aria-pressed", String(isFav));
    btn.setAttribute("aria-label", label);
    btn.textContent = label;
  }

  #attachEventListeners() {
    if (this.#elements.button) {
      this.#elements.button.addEventListener(
        "click",
        this.#handleFavoriteToggle
      );
    }
  }

  #cleanup() {
    if (this.#elements.button) {
      this.#elements.button.removeEventListener(
        "click",
        this.#handleFavoriteToggle
      );
    }
    this.#elements = {};
    this.#details = null;
  }

  #handleFavoriteToggle = () => {
    if (!this.#details) return;

    const newFavoriteState = !this.isFavorite;

    this.emit("favorite-toggle", {
      film: {
        imdbID: this.#details.imdbID,
        Title: this.#details.Title,
        Poster: this.#details.Poster,
        Year: this.#details.Year,
        Type: this.#details.Type,
        isFavorite: newFavoriteState,
      },
      isFavorite: newFavoriteState,
    });
  };

  #extractFilmData(details) {
    return {
      posterUrl: this.#getValidValue(
        details.Poster,
        CONSTANTS.PLACEHOLDER.IMAGE
      ),
      title: details.Title || CONSTANTS.PLACEHOLDER.TITLE,
      writer: this.#getValidValue(details.Writer),
      genre: details.Genre || CONSTANTS.PLACEHOLDER.TEXT,
      actors: this.#getValidValue(details.Actors),
      year: details.Released || CONSTANTS.PLACEHOLDER.TEXT,
      runtime: details.Runtime || CONSTANTS.PLACEHOLDER.TEXT,
      director: details.Director || CONSTANTS.PLACEHOLDER.TEXT,
      plot: details.Plot || "",
      rating: this.#buildRating(details),
      tags: details.Genre || [],
    };
  }

  #getValidValue(value, placeholder = CONSTANTS.PLACEHOLDER.TEXT) {
    return value && value !== CONSTANTS.NO_DATA ? value : placeholder;
  }

  #buildRating(details) {
    const ratingParts = [];

    if (details.imdbRating && details.imdbRating !== CONSTANTS.NO_DATA) {
      ratingParts.push(`${details.imdbRating}/10`);
    }

    if (details.Metascore && details.Metascore !== CONSTANTS.NO_DATA) {
      ratingParts.push(`${details.Metascore} Metascore`);
    }

    if (Array.isArray(details.Ratings)) {
      const rottenTomatoes = details.Ratings.find(
        (r) => r.Source === "Rotten Tomatoes"
      );
      if (rottenTomatoes?.Value) {
        ratingParts.push(rottenTomatoes.Value);
      }
    }

    return ratingParts.length > 0
      ? ratingParts.join(" • ")
      : CONSTANTS.PLACEHOLDER.TEXT;
  }
}

customElements.define("film-details", FilmDetailsInfo);
