import { debounce } from "../../../common/utils/debounce.js";

const styles = `
  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .wrapper {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
  }

  input {
    background: #DEDEDE;
    border: none;
    border-radius: 5px;
    color: #252525;
    padding: 15px 15px 15px 50px;
    flex: 1;
    font-size: 14px;
    width: 100%;
    outline: none;
  }

  input::placeholder {
    color: #494949;
  }

  ::slotted([slot="icon"]) {
    position: absolute;
    left: 15px;
    top: 15px;
    pointer-events: none;
    width: 20px;
    height: 20px;
    display: block;
  }
`;

export class SearchInput extends HTMLElement {
  #debouncedOnInput = null;
  #lastEmittedValue = "";

  static get observedAttributes() {
    return ["value", "placeholder"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "closed" });

    this.#debouncedOnInput = debounce((query) => {
      this.dispatchEvent(
        new CustomEvent("search-input", {
          detail: { query },
          bubbles: true,
          composed: true,
        })
      );
    }, 300);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "value":
        this.#updateValue();
        break;
      case "placeholder":
        this.#updatePlaceholder();
        break;
    }
  }

  get value() {
    const input = this._root.querySelector("input");
    if (input) return input.value;
    return this.getAttribute("value") || "";
  }

  set value(v) {
    const input = this._root.querySelector("input");
    if (input) input.value = v || "";
    else this.setAttribute("value", v || "");
  }

  #render() {
    this._root.innerHTML = "";
    this._root.appendChild(this.#adoptGlobalStyles());
    this._root.appendChild(this.#createStyle(styles));

    const template = document.createElement("template");
    template.innerHTML = `
      <div class="wrapper">
        <input
          type="text"
          class="search-input"
          value="${this.getAttribute("value") || ""}"
          placeholder="${this.getAttribute("placeholder") || "Find a film...."}"
          aria-label="Search input"
        />
        <slot name="icon"></slot>
      </div>
    `;

    this._root.appendChild(template.content.cloneNode(true));
  }

  #updateValue() {
    const input = this._root.querySelector("input");
    if (!input) return;
    const attr = this.getAttribute("value") || "";
    if (input.value !== attr) input.value = attr;
  }

  #updatePlaceholder() {
    const input = this._root.querySelector("input");
    if (!input) return;
    const attr = this.getAttribute("placeholder") || "Find a film....";
    input.placeholder = attr;
  }

  connectedCallback() {
    this.#render();

    const input = this._root.querySelector("input");

    if (!input) return;

    input.addEventListener("change", this.#onInternalInput);
    input.addEventListener("keydown", this.#onInternalKeydown);
  }

  disconnectedCallback() {
    const input = this._root.querySelector("input");

    if (!input) return;

    input.removeEventListener("change", this.#onInternalInput);
    input.removeEventListener("keydown", this.#onInternalKeydown);

    if (
      this.#debouncedOnInput &&
      typeof this.#debouncedOnInput.cancel === "function"
    ) {
      this.#debouncedOnInput.cancel();
    }
  }

  #onInternalInput = (e) => {
    const query = e.target.value.trim();

    if (query === this.#lastEmittedValue) {
      return;
    }

    this.#lastEmittedValue = query;

    this.#debouncedOnInput(query);
  };

  #onInternalKeydown = (e) => {
    if (e.key !== "Enter" && e.code !== "Enter" && e.code !== "NumpadEnter")
      return;

    e.preventDefault();
    const query = e.target.value.trim();

    this.#lastEmittedValue = query;

    this.dispatchEvent(
      new CustomEvent("search", {
        detail: { query },
        bubbles: true,
        composed: true,
      })
    );
  };

  focus() {
    const input = this._root.querySelector("input");
    if (!input) return;

    input.focus();
  }

  cancelPending() {
    if (
      this.#debouncedOnInput &&
      typeof this.#debouncedOnInput.cancel === "function"
    ) {
      this.#debouncedOnInput.cancel();
    }
  }

  #createStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    return style;
  }

  #adoptGlobalStyles() {
    const globalVars = `
      :host {
        --black: #000;
        --white: #fff;
      }
    `;
    return this.#createStyle(globalVars);
  }
}

customElements.define("search-input", SearchInput);
