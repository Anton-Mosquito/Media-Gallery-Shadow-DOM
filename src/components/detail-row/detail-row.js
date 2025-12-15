const template = document.createElement("template");

const style = document.createElement("style");
style.textContent = `
    :host([description]), :host([tags]) {
      display: flex;
      flex-direction: column;
      gap: var(--detail-row-gap, 8px);
    }

    :host([description]) .label,
    :host([tags]) .label {
      margin: var(--detail-row-label-margin, 24px 0 8px 0);
      font-weight: var(--detail-row-label-weight, 600);
      font-size: var(--detail-row-label-size, 16px);
      color: var(--detail-row-label-color, inherit);
    }

    :host([description]) .value {
      line-height: var(--detail-row-value-line-height, 1.6);
      color: var(--detail-row-value-color, #333);
    }

    :host([tags]) .value {
      display: flex;
      gap: var(--detail-row-tags-gap, 10px);
      flex-wrap: wrap;
      margin-top: var(--detail-row-tags-margin-top, 8px);
    }

    .tag {
      border: 1px solid var(--detail-row-tag-border-color, #222);
      padding: var(--detail-row-tag-padding, 6px 10px);
      border-radius: var(--detail-row-tag-radius, 8px);
      background: var(--detail-row-tag-bg, transparent);
      color: var(--detail-row-tag-color, #222);
      font-size: var(--detail-row-tag-font-size, inherit);
      transition: var(--detail-row-tag-transition, none);
    }

    .tag:hover {
      background: var(--detail-row-tag-hover-bg, rgba(0, 0, 0, 0.05));
    }

    .value:empty::before {
      content: var(--detail-row-empty-text, '—');
      color: var(--detail-row-empty-color, #999);
    }
`;

const label = document.createElement("div");
label.className = "label";

const value = document.createElement("div");
value.className = "value";

template.content.append(style, label, value);

export class DetailRow extends HTMLElement {
  #root;
  #labelEl;
  #valueEl;
  #currentValue = null;
  #currentMode = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "closed" });
    this.#root.appendChild(template.content.cloneNode(true));

    this.#labelEl = this.#root.querySelector(".label");
    this.#valueEl = this.#root.querySelector(".value");
  }

  static get observedAttributes() {
    return ["label", "value", "tags", "description"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "label":
        this.#updateLabel(newValue);
        break;
      case "value":
        this.#updateValue(newValue);
        break;
      case "tags":
      case "description":
        this.#updateValue(this.getAttribute("value"));
        break;
    }
  }

  connectedCallback() {
    this.#updateLabel(this.getAttribute("label"));
    this.#updateValue(this.getAttribute("value"));
  }

  #updateLabel(label) {
    this.#labelEl.textContent = label || "";
  }

  #updateValue(value) {
    const normalizedValue = value || "";
    const isTagsMode = this.hasAttribute("tags");

    if (
      this.#currentValue === normalizedValue &&
      this.#currentMode === isTagsMode
    ) {
      return;
    }

    this.#currentValue = normalizedValue;
    this.#currentMode = isTagsMode;

    if (isTagsMode) {
      this.#renderTags(normalizedValue);
    } else {
      this.#renderText(normalizedValue);
    }
  }

  #renderText(text) {
    this.#valueEl.textContent = text;
  }

  #renderTags(tagsString) {
    const tags = this.#parseTags(tagsString);
    const fragment = document.createDocumentFragment();

    tags.forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      span.setAttribute("role", "listitem");
      fragment.appendChild(span);
    });

    this.#valueEl.replaceChildren(fragment);

    if (tags.length > 0) {
      this.#valueEl.setAttribute("role", "list");
    } else {
      this.#valueEl.removeAttribute("role");
    }
  }

  #parseTags(tagsString) {
    if (!tagsString) return [];

    return tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  setLabel(label) {
    this.setAttribute("label", label);
  }

  setValue(value) {
    this.setAttribute("value", value);
  }

  setTags(tags) {
    if (Array.isArray(tags)) {
      this.setAttribute("value", tags.join(", "));
      this.setAttribute("tags", "");
    }
  }
}

customElements.define("detail-row", DetailRow);
