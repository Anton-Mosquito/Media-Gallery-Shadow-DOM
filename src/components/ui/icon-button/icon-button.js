const styles = `
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    width: 36px;
    height: 32px;
    background: none;
    border: 1px solid var(--button-border-color, #fff);
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
  }

  :host(:hover) {
    transform: scale(1.05);
  }

  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    pointer-events: none;
  }

  :host(.active) {
    background: var(--button-active-bg, #fff);
  }

  button {
    all: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: none;
    background: none;
    cursor: inherit;
    padding: 0;
  }

  ::slotted(img) {
    display: block;
    width: 18px;
    height: 18px;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

export class IconButton extends HTMLElement {
  #shadow = null;
  #button = null;
  #isActive = false;

  static get observedAttributes() {
    return ["active", "aria-label", "aria-pressed", "disabled"];
  }

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.#render();
    this.#attachEventListeners();

    // Make it keyboard accessible
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "button");
    }
  }

  disconnectedCallback() {
    this.#removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "active":
        this.#isActive = this.hasAttribute("active");
        this.#updateActiveState();
        break;
      case "aria-label":
        if (this.#button) {
          this.#button.setAttribute("aria-label", newValue || "");
        }
        break;
      case "aria-pressed":
        if (this.#button) {
          this.#button.setAttribute("aria-pressed", newValue || "false");
        }
        break;
      case "disabled":
        if (this.#button) {
          this.#button.disabled = this.hasAttribute("disabled");
        }
        this.#updateDisabledState();
        break;
    }
  }

  get active() {
    return this.#isActive;
  }

  set active(value) {
    if (value) {
      this.setAttribute("active", "");
    } else {
      this.removeAttribute("active");
    }
  }

  #render() {
    const style = document.createElement("style");
    style.textContent = styles;

    this.#button = document.createElement("button");
    this.#button.setAttribute("type", "button");

    // Set initial attributes
    if (this.hasAttribute("aria-label")) {
      this.#button.setAttribute("aria-label", this.getAttribute("aria-label"));
    }
    if (this.hasAttribute("aria-pressed")) {
      this.#button.setAttribute(
        "aria-pressed",
        this.getAttribute("aria-pressed")
      );
    }
    if (this.hasAttribute("disabled")) {
      this.#button.disabled = true;
    }

    // Add slot for icon
    const slot = document.createElement("slot");
    this.#button.appendChild(slot);

    this.#shadow.innerHTML = "";
    this.#shadow.appendChild(style);
    this.#shadow.appendChild(this.#button);

    this.#updateActiveState();
    this.#updateDisabledState();
  }

  #updateActiveState() {
    if (this.#isActive) {
      this.classList.add("active");
    } else {
      this.classList.remove("active");
    }
  }

  #updateDisabledState() {
    if (this.hasAttribute("disabled")) {
      this.setAttribute("aria-disabled", "true");
      this.setAttribute("tabindex", "-1");
    } else {
      this.removeAttribute("aria-disabled");
      this.setAttribute("tabindex", "0");
    }
  }

  #handleKeydown = (event) => {
    if (this.hasAttribute("disabled")) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.#button?.click();
    }
  };

  #attachEventListeners() {
    this.addEventListener("keydown", this.#handleKeydown);
  }

  #removeEventListeners() {
    this.removeEventListener("keydown", this.#handleKeydown);
  }
}

customElements.define("icon-button", IconButton);
