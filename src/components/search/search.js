import { BaseComponent } from "../../common/base-component.js";
import "../ui/search-input/search-input.js";
import "../ui/icon-button/icon-button.js";

const styles = `
  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .search {
    display: flex;
    width: 100%;
    gap: 10px;
    margin-bottom: 30px;
  }

  .search__button img {
    width: 30px;
    height: 30px;
  }

  .search__button {
    border: none;
    background: var(--black, #000);
    border-radius: 5px;
    display: flex;
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
`;

export class SearchComponent extends BaseComponent {
  static get observedAttributes() {
    return ["query", "placeholder"];
  }

  constructor() {
    super();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "query":
        this.#updateInput();
        break;
      case "placeholder":
        this.#updatePlaceholder();
        break;
    }
  }

  #updateInput() {
    const inputComp = this._root.querySelector("search-input");
    if (!inputComp) return;

    const attr = this.getAttribute("query") || "";

    if (inputComp.value !== attr) inputComp.value = attr;
  }

  #updatePlaceholder() {
    const inputComp = this._root.querySelector("search-input");
    if (!inputComp) return;

    const attr =
      this.getAttribute("placeholder") || "Find a book or author....";
    inputComp.setAttribute("placeholder", attr);
  }

  render() {
    this._root.innerHTML = "";
    this._root.appendChild(this.adoptGlobalStyles());
    this._root.appendChild(this.createStyle(styles));

    const template = document.createElement("template");
    template.innerHTML = `
      <div class="search">
        <search-input
          value="${this.getAttribute("query") || ""}"
          placeholder="${
            this.getAttribute("placeholder") || "Find a book or author...."
          }"
        >
          <img slot="icon" src="/static/search.svg" alt="Search icon" />
        </search-input>
        <icon-button class="search__button" aria-label="Search">
          <img src="/static/search-white.svg" alt="Search icon" />
        </icon-button>
      </div>
    `;

    this._root.appendChild(template.content.cloneNode(true));
  }

  attachEventListeners() {
    const button = this._root.querySelector("icon-button");
    const input = this._root.querySelector("search-input");

    if (button) button.addEventListener("icon-button-click", this.#handleClick);
    if (input) {
      input.addEventListener("search-input", this.#handleSearch);
      input.addEventListener("search", this.#handleSearch);
    }
  }

  #handleClick = () => {
    const inputComp = this._root.querySelector("search-input");
    const query = inputComp ? (inputComp.value || "").trim() : "";
    this.emit("search", { query });
  };

  #handleSearch = (e) => {
    const evtQuery =
      e?.detail && typeof e.detail.query === "string"
        ? e.detail.query.trim()
        : null;

    if (evtQuery != null) {
      this.emit("search", { query: evtQuery });
      return;
    }

    const inputComp = this._root.querySelector("search-input");
    const query = inputComp ? (inputComp.value || "").trim() : "";

    this.emit("search", { query });
  };

  disconnectedCallback() {
    const button = this._root.querySelector("icon-button");
    const inputComp = this._root.querySelector("search-input");

    if (inputComp) {
      inputComp.removeEventListener("search-input", this.#handleSearch);
      inputComp.removeEventListener("search", this.#handleSearch);
    }
    if (button)
      button.removeEventListener("icon-button-click", this.#handleClick);
    if (super.disconnectedCallback) super.disconnectedCallback();
  }
}

customElements.define("search-component", SearchComponent);
