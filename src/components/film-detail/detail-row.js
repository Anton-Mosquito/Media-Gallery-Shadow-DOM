const styles = `
:host([description]), :host([tags]) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:host([description]) .label,
:host([tags]) .label {
  margin: 24px 0 8px 0;
  font-weight: 600;
  font-size: 16px;
}

:host([description]) .value {
  line-height: 1.6;
  color: #333;
}

:host([tags]) .value {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag {
  border: 1px solid #222;
  padding: 6px 10px;
  border-radius: 8px;
  background: transparent;
  color: #222;
}
`;

export class DetailRow extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = styles;

    this._labelEl = document.createElement("div");
    this._labelEl.className = "label";

    this._valueEl = document.createElement("div");
    this._valueEl.className = "value";

    this._root.appendChild(style);
    this._root.appendChild(this._labelEl);
    this._root.appendChild(this._valueEl);
  }

  static get observedAttributes() {
    return ["label", "value", "description", "tags"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.#render();
  }

  connectedCallback() {
    this.#render();
  }

  #render() {
    const label = this.getAttribute("label") || "";
    const value = this.getAttribute("value") || "";

    this._labelEl.textContent = label;

    while (this._valueEl.firstChild) {
      this._valueEl.removeChild(this._valueEl.firstChild);
    }

    if (this.hasAttribute("tags")) {
      (value || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => {
          const span = document.createElement("span");
          span.className = "tag";
          span.textContent = t;
          this._valueEl.appendChild(span);
        });
    } else {
      this._valueEl.textContent = value;
    }
  }
}

customElements.define("detail-row", DetailRow);
