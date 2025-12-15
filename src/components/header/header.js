import { BaseComponent } from "../../common/base-component.js";

const styles = `
  .logo img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    display: block;
  }

  .menu__item img {
    width: 22px;
    height: 22px;
    object-fit: contain;
    display: block;
  }

  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;
    margin-top: 20px;
  }

  .logo {
    display: flex;
    align-items: center;
  }

  .menu {
    display: flex;
    align-items: center;
    gap: 30px;
  }

  .menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    line-height: 20px;
    text-decoration: none;
    color: var(--black, #000);
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .menu__item:hover {
    opacity: 0.7;
  }

  .menu__item:visited {
    color: var(--black, #000);
  }

  .menu__counter {
    font-weight: 600;
    font-size: 12px;
    line-height: 28px;
    border: 1px solid var(--black, #000);
    border-radius: 50%;
    padding: 0 10px;
    min-width: 28px;
    text-align: center;
  }

  /* Slot styles */
  ::slotted([slot="logo"]) {
    height: 40px;
  }

  ::slotted([slot="extra-menu"]) {
    margin-left: 20px;
  }
`;

export class HeaderComponent extends BaseComponent {
  static get observedAttributes() {
    return ["favorites-count"];
  }

  constructor() {
    super();
  }

  get favoritesCount() {
    const v = Number(this.getAttribute("favorites-count"));
    return Number.isFinite(v) ? v : 0;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "favorites-count" && oldValue !== newValue) {
      this.#updateCounter();
    }
  }

  #updateCounter() {
    const counter = this._root.querySelector(".menu__counter");
    if (!counter) return;

    counter.textContent = String(this.favoritesCount);
  }

  render() {
    this._root.innerHTML = "";
    this._root.appendChild(this.adoptGlobalStyles());
    this._root.appendChild(this.createStyle(styles));

    const template = document.createElement("template");
    template.innerHTML = `
      <div class="header">
        <div class="logo">
          <slot name="logo">
            <img src="./static/cinema.svg" alt="Logo" />
          </slot>
        </div>
        <div class="menu">
          <a class="menu__item" href="#" data-nav="search">
            <img src="./static/search.svg" alt="Search icon" />
            <span>Search books</span>
          </a>
          <a class="menu__item" href="#favorites" data-nav="favorites">
            <img src="./static/favorite.svg" alt="Favorites icon" />
            <span>Favorites</span>
            <div class="menu__counter">${this.favoritesCount}</div>
          </a>
          <slot name="extra-menu"></slot>
        </div>
      </div>
    `;

    this._root.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("header-component", HeaderComponent);
