import { BaseComponent } from "../../common/base-component.js";

const styles = `
  :host {
    display: block;
    width: 100%;
  }

  .card-list__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    padding: 30px;
    color: var(--black, #000);
  }

  .card-list__empty {
    text-align: center;
    padding: 40px 20px;
    color: #666;
  }

  .card_grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 30px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .card_grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
  }

  /* Slot для custom loader */
  ::slotted([slot="loader"]) {
    width: 100%;
    text-align: center;
    padding: 30px;
  }

  ::slotted([slot="empty"]) {
    width: 100%;
    text-align: center;
    padding: 40px;
  }
`;

export class CardListComponent extends BaseComponent {
  static get observedAttributes() {
    return ["loading"];
  }

  constructor() {
    super();
    this._loading = false;
    this._cards = [];
  }

  get loading() {
    return this._loading;
  }

  set loading(value) {
    this._loading = value === true || value === "true";
    if (this._loading) {
      this.setAttribute("loading", "");
    } else {
      this.removeAttribute("loading");
    }
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "loading" && oldValue !== newValue) {
      this._loading = this.hasAttribute("loading");
      this.render();
    }
  }

  // Method для додавання карток
  setCards(cardsData) {
    this._cards = cardsData;
    this.renderCards();
  }

  render() {
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(this.adoptGlobalStyles());
    this.shadowRoot.appendChild(this.createStyle(styles));

    if (this._loading) {
      const template = document.createElement("template");
      template.innerHTML = `
        <div class="card-list__loader">
          <slot name="loader">Loading...</slot>
        </div>
      `;
      this.shadowRoot.appendChild(template.content.cloneNode(true));
      return;
    }

    const template = document.createElement("template");
    template.innerHTML = `
      <div class="card_grid" id="card-grid"></div>
      <div class="card-list__empty" id="empty-state" style="display: none;">
        <slot name="empty">No books found</slot>
      </div>
    `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.renderCards();
  }

  renderCards() {
    const grid = this.shadowRoot.querySelector("#card-grid");
    const emptyState = this.shadowRoot.querySelector("#empty-state");

    if (!grid) return;

    grid.innerHTML = "";

    if (this._cards.length === 0) {
      grid.style.display = "none";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    grid.style.display = "grid";
    if (emptyState) emptyState.style.display = "none";

    this._cards.forEach((cardData) => {
      const card = document.createElement("card-component");
      card.bookKey = cardData.key;
      card.title = cardData.title;
      card.author = cardData.author_name
        ? cardData.author_name[0]
        : "Unknown author";
      card.subject = cardData.subject ? cardData.subject[0] : "Unknown";
      card.cover = `https://covers.openlibrary.org/b/olid/${cardData.cover_edition_key}-M.jpg`;
      card.isFavorite = cardData.isFavorite || false;

      grid.appendChild(card);
    });
  }

  attachEventListeners() {
    this.shadowRoot.addEventListener("favorite-toggle", (e) => {
      this.emit("favorite-toggle", e.detail);
    });
  }
}

customElements.define("card-list-component", CardListComponent);
