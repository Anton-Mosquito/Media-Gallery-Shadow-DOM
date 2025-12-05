import { DivComponent } from "../../common/div-component";
import "./card.css";

export class Card extends DivComponent {
  constructor(appState, cardState) {
    super();
    this.appState = appState;
    this.cardState = cardState;
  }

  #addToFavorites() {
    this.appState.favorites.push(this.cardState);
  }

  #deleteFromFavorites() {
    this.appState.favorites = this.appState.favorites.filter(
      (b) => b.key !== this.cardState.key
    );
  }

  render() {
    this.element.classList.add("card");
    const existInFavorites = this.appState.favorites.find(
      (b) => b.key == this.cardState.key
    );

    this.element.innerHTML = `
			<div class="card__image">
				<img src="https://covers.openlibrary.org/b/olid/${
          this.cardState.cover_edition_key
        }-M.jpg" alt="Обложка" />
			</div>
			<div class="card__info">
				<div class="card__tag">
					${this.cardState.subject ? this.cardState.subject[0] : "Unknown"}
				</div>
				<div class="card__name">
					${this.cardState.title}
				</div>
				<div class="card__author">
					${this.cardState.author_name ? this.cardState.author_name[0] : "Unknown author"}
				</div>
				<div class="card__footer">
					<button class="button__add ${existInFavorites ? "button__active" : ""}">
						${
              existInFavorites
                ? '<img src="/static/favorite.svg" />'
                : '<img src="/static/favorite-white.svg" />'
            }
					</button>
				</div>
			</div>
		`;

    if (existInFavorites) {
      this.element
        .querySelector("button")
        .addEventListener("click", this.#deleteFromFavorites.bind(this));
    } else {
      this.element
        .querySelector("button")
        .addEventListener("click", this.#addToFavorites.bind(this));
    }
    return this.element;
  }
}
