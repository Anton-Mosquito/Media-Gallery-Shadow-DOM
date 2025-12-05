import { BaseComponent } from "../../common/base-component.js";

const styles = `
    .search__icon img,
    .search__button img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      display: block;
    }
  :host {
    display: block;
    width: 100%;
  }

  .search {
    display: flex;
    width: 100%;
    gap: 10px;
    margin-bottom: 30px;
  }

  .search__wrapper {
    position: relative;
    flex: 1;
    display: flex;
  }

  .search__icon {
    position: absolute;
    left: 10px;
    top: 12px;
    pointer-events: none;
  }

  .search__input {
    background: #DEDEDE;
    border: none;
    border-radius: 5px;
    color: #252525;
    padding: 15px 30px 15px 50px;
    flex: 1;
    font-size: 14px;
  }

  .search__input::placeholder {
    color: #494949;
  }

  .search__input:focus {
    outline: 2px solid var(--black, #000);
    outline-offset: 2px;
  }

  .search__button {
    border: none;
    background: var(--black, #000);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 10px 20px;
    transition: opacity 0.2s;
  }

  .search__button:hover {
    opacity: 0.8;
  }

  .search__button:active {
    opacity: 0.6;
  }

  ::slotted([slot="search-icon"]) {
    width: 20px;
    height: 20px;
  }

  ::slotted([slot="button-icon"]) {
    width: 20px;
    height: 20px;
  }
`;

export class SearchComponent extends BaseComponent {
  static get observedAttributes() {
    return ["query", "placeholder"];
  }

  constructor() {
    super();
    this._query = "";
    this._placeholder = "Find a book or author....";
  }

  get query() {
    return this._query;
  }

  set query(value) {
    if (this._query !== value) {
      this._query = value;
      this.setAttribute("query", value);
    }
  }

  get placeholder() {
    return this._placeholder;
  }

  set placeholder(value) {
    this._placeholder = value;
    this.setAttribute("placeholder", value);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "query":
        this._query = newValue || "";
        this.updateInput();
        break;
      case "placeholder":
        this._placeholder = newValue || "Find a book or author....";
        this.updatePlaceholder();
        break;
    }
  }

  updateInput() {
    const input = this.shadowRoot.querySelector("input");
    if (input && input.value !== this._query) {
      input.value = this._query;
    }
  }

  updatePlaceholder() {
    const input = this.shadowRoot.querySelector("input");
    if (input) {
      input.placeholder = this._placeholder;
    }
  }

  render() {
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(this.adoptGlobalStyles());
    this.shadowRoot.appendChild(this.createStyle(styles));

    const template = document.createElement("template");
    template.innerHTML = `
      <div class="search">
        <div class="search__wrapper">
          <input
            name="search"
            type="text"
            placeholder="${this._placeholder}"
            class="search__input"
            value="${this._query}"
            aria-label="Search input"
          />
          <div class="search__icon">
            <slot name="search-icon">
              <img src="/static/search.svg" alt="Search icon" />
            </slot>
          </div>
        </div>
        <button class="search__button" aria-label="Search">
          <slot name="button-icon">
            <img src="/static/search-white.svg" alt="Search icon" />
          </slot>
        </button>
      </div>
    `;

    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  attachEventListeners() {
    const button = this.shadowRoot.querySelector(".search__button");
    const input = this.shadowRoot.querySelector("input");

    button.addEventListener("click", () => this.handleSearch());

    input.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        this.handleSearch();
      }
    });

    // Real-time input change
    input.addEventListener("input", (e) => {
      this._query = e.target.value;
      // Емітимо подію для real-time пошуку (опціонально)
      this.emit("search-input", { query: this._query });
    });
  }

  handleSearch() {
    const input = this.shadowRoot.querySelector("input");
    const query = input.value.trim();

    // Емітимо подію пошуку
    this.emit("search", { query });
  }
}

customElements.define("search-component", SearchComponent);
