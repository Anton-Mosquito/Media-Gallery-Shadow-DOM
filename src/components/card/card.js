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
    height: 180px;
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

  .button__active img {
    filter: invert(1);
  }

  /* Slot styling */
  ::slotted([slot="actions"]) {
    margin-left: 8px;
  }
`;

export class CardComponent extends BaseComponent {
  static get observedAttributes() {
    return ["book-key", "title", "author", "subject", "cover", "is-favorite"];
  }

  constructor() {
    super();
    this._bookData = {
      key: "",
      title: "",
      author: "",
      subject: "",
      cover: "",
      isFavorite: false,
    };
  }

  get bookKey() {
    return this._bookData.key;
  }
  set bookKey(value) {
    this._bookData.key = value;
    this.setAttribute("book-key", value);
  }

  get title() {
    return this._bookData.title;
  }
  set title(value) {
    this._bookData.title = value;
    this.setAttribute("title", value);
  }

  get author() {
    return this._bookData.author;
  }
  set author(value) {
    this._bookData.author = value;
    this.setAttribute("author", value);
  }

  get subject() {
    return this._bookData.subject;
  }
  set subject(value) {
    this._bookData.subject = value;
    this.setAttribute("subject", value);
  }

  get cover() {
    return this._bookData.cover;
  }
  set cover(value) {
    this._bookData.cover = value;
    this.setAttribute("cover", value);
  }

  get isFavorite() {
    return this._bookData.isFavorite;
  }
  set isFavorite(value) {
    this._bookData.isFavorite = value === true || value === "true";
    if (this._bookData.isFavorite) {
      this.setAttribute("is-favorite", "");
    } else {
      this.removeAttribute("is-favorite");
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "book-key":
        this._bookData.key = newValue || "";
        break;
      case "title":
        this._bookData.title = newValue || "";
        this.updateContent();
        break;
      case "author":
        this._bookData.author = newValue || "Unknown author";
        this.updateContent();
        break;
      case "subject":
        this._bookData.subject = newValue || "Unknown";
        this.updateContent();
        break;
      case "cover":
        this._bookData.cover = newValue || "";
        this.updateCover();
        break;
      case "is-favorite":
        this._bookData.isFavorite = this.hasAttribute("is-favorite");
        this.updateButton();
        break;
    }
  }

  updateContent() {
    const titleEl = this.shadowRoot.querySelector(".card__name");
    const authorEl = this.shadowRoot.querySelector(".card__author");
    const subjectEl = this.shadowRoot.querySelector(".card__tag");

    if (titleEl) titleEl.textContent = this._bookData.title;
    if (authorEl) authorEl.textContent = this._bookData.author;
    if (subjectEl) subjectEl.textContent = this._bookData.subject;
  }

  updateCover() {
    const img = this.shadowRoot.querySelector(".card__image img");
    if (img) {
      img.src = this._bookData.cover;
    }
  }

  updateButton() {
    const button = this.shadowRoot.querySelector(".button__add");
    if (!button) return;

    if (this._bookData.isFavorite) {
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
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(this.adoptGlobalStyles());
    this.shadowRoot.appendChild(this.createStyle(styles));

    const template = document.createElement("template");
    template.innerHTML = `
      <div class="card">
        <div class="card__image">
          <img src="${this._bookData.cover}" alt="Book cover" loading="lazy" />
        </div>
        <div class="card__info">
          <div class="card__tag">${this._bookData.subject || "Unknown"}</div>
          <div class="card__name">${this._bookData.title || "Untitled"}</div>
          <div class="card__author">${
            this._bookData.author || "Unknown author"
          }</div>
          <div class="card__footer">
            <button class="button__add ${
              this._bookData.isFavorite ? "button__active" : ""
            }" 
                    aria-label="${
                      this._bookData.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }">
              <img src="/static/favorite${
                this._bookData.isFavorite ? "" : "-white"
              }.svg" 
                   alt="${
                     this._bookData.isFavorite
                       ? "Remove from favorites"
                       : "Add to favorites"
                   }" />
            </button>
            <slot name="actions"></slot>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  attachEventListeners() {
    const button = this.shadowRoot.querySelector(".button__add");
    button.addEventListener("click", () => this.handleFavoriteToggle());
  }

  handleFavoriteToggle() {
    const newState = !this._bookData.isFavorite;

    // Емітимо подію з даними книги
    this.emit("favorite-toggle", {
      book: {
        key: this._bookData.key,
        title: this._bookData.title,
        author: this._bookData.author,
        subject: this._bookData.subject,
        cover_edition_key: this._bookData.cover.split("/").pop().split("-")[0],
        author_name: [this._bookData.author],
      },
      isFavorite: newState,
    });
  }
}

customElements.define("card-component", CardComponent);
