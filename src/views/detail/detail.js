import { AbstractView } from "../../common/view";
import { filmService } from "../../common/film-service.js";
import { FavoritesService } from "../../common/favorites-service";
import { eventBus } from "../../common/event-bus";
import "../../components/header/header.js";
import "../../components/ui/icon-button/icon-button.js";

const styles = `
:host {
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
  gap: 40px;
  align-items: flex-start;
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
}

.info {
  flex: 1;
}

.title {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color, #111);
}

.details-list {
  display: grid;
  grid-template-columns: max-content auto;
  gap: 8px 20px;
  align-items: center;
  margin-bottom: 18px;
}

.details-list .label {
  font-weight: 600;
  color: #333;
}

.fav-button {
  display: inline-block;
  background: var(--black, #000);
  color: var(--white, #fff);
  border: none;
  padding: 12px 22px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.section-title {
  margin: 24px 0 8px 0;
  font-weight: 600;
}

.plot {
  line-height: 1.6;
  color: #333;
}

.tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.tag {
  border: 1px solid #222;
  padding: 8px 12px;
  border-radius: 8px;
  background: transparent;
  color: #222;
}
`;

export class DetailView extends AbstractView {
  constructor(appState) {
    super();
    this.appState = appState;
    this.data = null;
  }

  connectedCallback() {
    this.render();
  }

  async render() {
    this.app.innerHTML = "";

    const header = document.createElement("header-component");
    header.setAttribute(
      "favorites-count",
      String(this.appState.favorites.length)
    );

    const container = document.createElement("main");
    container.className = "detail-view";
    const style = document.createElement("style");
    style.textContent = styles;
    container.appendChild(style);

    const wrapper = document.createElement("div");
    wrapper.className = "detail";

    wrapper.innerHTML = `
      <div class="poster" id="poster">Loading...</div>
      <div class="info">
        <h1 class="title">Loading...</h1>

        <div class="details-list">
          <div class="label">Writer :</div>
          <div id="writer">&nbsp;</div>

          <div class="label">Category :</div>
          <div id="genre">&nbsp;</div>

          <div class="label">Actors :</div>
          <div id="actors">&nbsp;</div>

          <div class="label">Ratings :</div>
          <div id="rating">&nbsp;</div>

          <div class="label">Released</div>
          <div id="year">&nbsp;</div>

          <div class="label">Minutes:</div>
          <div id="runtime">&nbsp;</div>
        </div>

        <icon-button id="favBtn" aria-label="Add to favorites">
          <img src="/static/favorite-white.svg" alt="Add to favorites" />
        </icon-button>

        <div class="section-title">Description:</div>
        <div class="plot" id="plot">&nbsp;</div>

        <div class="section-title">Tags:</div>
        <div class="tags" id="tags"></div>
      </div>
    `;

    container.appendChild(wrapper);

    // Prepend header so it matches layout of other views
    this._header = header;
    this.app.innerHTML = "";
    this.app.appendChild(container);
    this.app.prepend(header);

    const imdbID = this.appState.selectedFilmId;
    if (!imdbID) {
      document.querySelector(".title").textContent = "No film selected";
      return;
    }

    try {
      const details = await filmService.getFilmById(imdbID);
      this.data = details;
      this.#populate(details);
    } catch (err) {
      console.error("DetailView load error", err);
      const titleEl = this.app.querySelector(".title");
      if (titleEl) titleEl.textContent = "Error loading film";
    }

    this.#attachListeners();
  }

  #populate(details) {
    const posterEl = this.app.querySelector("#poster");
    const titleEl = this.app.querySelector(".title");
    const plotEl = this.app.querySelector("#plot");
    const tagsEl = this.app.querySelector("#tags");
    const favBtn = this.app.querySelector("#favBtn");
    const writer = this.app.querySelector("#writer");
    const genreEl = this.app.querySelector("#genre");
    const yearEl = this.app.querySelector("#year");
    const runtimeEl = this.app.querySelector("#runtime");
    const ratingEl = this.app.querySelector("#rating");
    const actorsEl = this.app.querySelector("#actors");

    writer.textContent =
      details.Writer && details.Writer !== "N/A" ? details.Writer : "";

    posterEl.innerHTML = `<img src="${
      details.Poster !== "N/A" ? details.Poster : "/static/placeholder.png"
    }" alt="${details.Title}" />`;
    titleEl.textContent = details.Title || "Untitled";

    yearEl.textContent = details.Year || "-";
    genreEl.textContent = details.Genre || "-";
    runtimeEl.textContent = details.Runtime || "-";

    plotEl.textContent = details.Plot || "";

    // rating: build from available sources (IMDb, Metascore, Rotten Tomatoes)
    if (ratingEl) {
      const parts = [];
      if (details.imdbRating && details.imdbRating !== "N/A") {
        parts.push(`${details.imdbRating}/10`);
      }
      if (details.Metascore && details.Metascore !== "N/A") {
        parts.push(`${details.Metascore} Metascore`);
      }
      if (Array.isArray(details.Ratings)) {
        const rt = details.Ratings.find((r) => r.Source === "Rotten Tomatoes");
        if (rt && rt.Value) parts.push(rt.Value);
      }
      ratingEl.textContent = parts.length ? parts.join(" • ") : "-";
    }

    // actors
    if (actorsEl) {
      actorsEl.textContent =
        details.Actors && details.Actors !== "N/A" ? details.Actors : "-";
    }

    // tags from Genre
    tagsEl.innerHTML = "";
    if (details.Genre) {
      details.Genre.split(",")
        .map((t) => t.trim())
        .forEach((g) => {
          const el = document.createElement("div");
          el.className = "tag";
          el.textContent = g;
          tagsEl.appendChild(el);
        });
    }

    // favourite state (robust check for different shapes)
    const isFav = this.appState.favorites.some(
      (f) => f.imdbID === details.imdbID || f.id === details.imdbID
    );

    // icon-button uses an internal button; mirror card behavior: set `active` attr and update slotted img
    if (favBtn) {
      const img = favBtn.querySelector("img");
      const iconSrc = isFav
        ? "/static/favorite.svg"
        : "/static/favorite-white.svg";
      if (isFav) favBtn.setAttribute("active", "");
      else favBtn.removeAttribute("active");
      favBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
      if (img) {
        img.src = iconSrc;
        img.alt = isFav ? "Remove from favorites" : "Add to favorites";
      }
    }
  }

  #attachListeners() {
    const favBtn = this.app.querySelector("#favBtn");

    if (favBtn) {
      favBtn.addEventListener("click", () => {
        if (!this.data) return;
        const isFav = this.appState.favorites.some(
          (f) => f.imdbID === this.data.imdbID || f.id === this.data.imdbID
        );
        FavoritesService.toggle(
          this.appState,
          { imdbID: this.data.imdbID, Title: this.data.Title },
          !isFav
        );

        const active = !isFav;

        // Update icon-button state and slotted image to reflect new favorite state
        if (favBtn) {
          const img = favBtn.querySelector("img");
          const iconSrc = active
            ? "/static/favorite.svg"
            : "/static/favorite-white.svg";
          if (active) favBtn.setAttribute("active", "");
          else favBtn.removeAttribute("active");
          favBtn.setAttribute("aria-pressed", active ? "true" : "false");
          if (img) {
            img.src = iconSrc;
            img.alt = active ? "Remove from favorites" : "Add to favorites";
          }
        }

        // update header favorites count if present
        if (this._header) {
          this._header.setAttribute(
            "favorites-count",
            String(this.appState.favorites.length)
          );
        }

        // emit global event so other views/components can react
        eventBus.emit("favorite-toggle", {
          film: { imdbID: this.data.imdbID, Title: this.data.Title },
          isFavorite: active,
        });
      });
    }
  }
}

customElements.define("detail-view", DetailView);
