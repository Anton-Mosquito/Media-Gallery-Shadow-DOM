import { BaseComponent } from "../../common/base-component.js";
import "../ui/loader/loader.js";

const styles = `
  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  :host([aria-busy="true"]) .card-grid {
    opacity: 0.6; pointer-events: none;
  }

  .card-list__empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--card-list-empty, #666);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--card-min,250px), 1fr));
    gap: var(--card-gap, 30px);
  }

  .card-list__loader {
    display: flex;
    align-items: center;
    justify-content: center;
  }
    
  card-list__empty[hidden] {
    display: none;
  }

  @media (max-width: 768px) {
    .card-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
  }

  ::slotted([slot="loader"]) { width:100%; text-align:center; padding:30px; }

  ::slotted([slot="empty"]) { width:100%; text-align:center; padding:40px; }

`;

export class CardListComponent extends BaseComponent {
  #cards = [];
  #isInited = false;

  static get observedAttributes() {
    return ["loading"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.#isInited) {
      this.#initShell();
      this.#isInited = true;
    }
    this.render();
  }

  get loading() {
    if (this.hasAttribute("loading")) {
      const attrValue = this.getAttribute("loading");
      return attrValue === "true";
    }
    return false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "loading" && oldValue !== newValue) {
      this.render();
    }
  }

  setCards(value) {
    this.#cards = value || [];
    this.render();
  }

  #initShell() {
    this._root.appendChild(this.adoptGlobalStyles());
    this._root.appendChild(this.createStyle(styles));

    const template = document.createElement("template");
    template.innerHTML = `
      <loader-component big class="card-list__loader" hidden></loader-component>
      <div class="card-grid" id="card-grid" role="list"></div>
      <div class="card-list__empty" id="empty-state" hidden>
        <slot name="empty">No films found</slot>
      </div>
    `;
    this._root.appendChild(template.content.cloneNode(true));
  }

  render() {
    if (!this._root) return;
    this.setAttribute("aria-busy", this.loading ? "true" : "false");

    const loader = this._root.querySelector("loader-component");
    const empty = this._root.querySelector("#empty-state");
    const grid = this._root.querySelector("#card-grid");

    if (this.loading) {
      if (loader) loader.hidden = false;
      if (grid) grid.style.display = "none";
      if (empty) empty.hidden = true;
      return;
    }

    if (loader) loader.hidden = true;
    if (grid) grid.style.display = "";

    this.#renderCards();
  }

  #renderCards() {
    const grid = this._root.querySelector("#card-grid");
    const emptyState = this._root.querySelector("#empty-state");

    if (!grid) return;

    grid.innerHTML = "";

    if (!this.#cards || this.#cards.length === 0) {
      grid.innerHTML = "";
      grid.style.display = "none";
      if (emptyState) emptyState.hidden = false;
      return;
    }

    grid.style.display = "";
    if (emptyState) emptyState.hidden = true;

    const frag = document.createDocumentFragment();

    this.#cards.forEach((cardData) => {
      const card = document.createElement("card-component");

      card.filmData = cardData;
      //card.setAttribute("film-data", JSON.stringify(cardData));
      frag.appendChild(card);
    });

    grid.innerHTML = "";
    grid.appendChild(frag);
  }
}

customElements.define("card-list-component", CardListComponent);
