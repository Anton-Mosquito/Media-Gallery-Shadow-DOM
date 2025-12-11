const styles = `
 :host {
   --loader-radius: 24px;
   --loader-track-width: 4px;
   --loader-track-color: #ADD8E6;
   --loader-spinner-color: #A9B5EC;
   --loader-start-angle: -45deg;

   display: inline-flex;
   align-items: center;
   justify-content: center;
 }

 :host([small]) {
   --loader-radius: 12px;
   --loader-track-width: 3px;
 }

 :host([middle]) {
   --loader-radius: 24px;
   --loader-track-width: 4px;
 }

 :host([big]) {
   --loader-radius: 48px;
   --loader-track-width: 6px;
 }

 :host([hidden]) { display: none !important; }

 .loader {
   width: calc(var(--loader-radius) * 2);
   height: calc(var(--loader-radius) * 2);
   position: relative;
   border: calc(var(--loader-track-width)) solid var(--loader-track-color);
   border-radius: 50%;
   animation: spinning 1s linear infinite;
   box-sizing: border-box;
 }

 .loader::after {
   content: '';
   width: var(--loader-radius);
   height: var(--loader-radius);
   border-top: calc(var(--loader-track-width)) solid var(--loader-spinner-color);
   border-right: calc(var(--loader-track-width)) solid var(--loader-spinner-color);
   border-top-right-radius: 100%;
   position: absolute;
   right: calc(-1 * var(--loader-track-width));
   top: calc(-1 * var(--loader-track-width));
   box-sizing: border-box;
 }

 @keyframes spinning {
   from { transform: rotate(var(--loader-start-angle)); }
   to { transform: rotate(calc(var(--loader-start-angle) + 360deg)); }
 }
`;
export class LoaderComponent extends HTMLElement {
  #shadow = null;

  static get observedAttributes() {
    return ["loading"];
  }

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "closed" });
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "loading") {
      const isLoading = newValue === "true";
      if (isLoading) this.removeAttribute("hidden");
      else this.setAttribute("hidden", "");
    }
  }

  #render() {
    const style = document.createElement("style");
    style.textContent = styles;

    const wrapper = document.createElement("div");
    wrapper.className = "loader";
    wrapper.setAttribute("part", "spinner");
    wrapper.setAttribute("aria-hidden", "true");

    this.#shadow.innerHTML = "";
    this.#shadow.appendChild(style);
    this.#shadow.appendChild(wrapper);
  }
}

customElements.define("loader-component", LoaderComponent);
