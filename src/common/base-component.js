// src/common/base-component.js
import { eventBus } from "./event-bus.js";

export class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "closed" });
    this._eventBus = eventBus;
    this._unsubscribers = [];
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    this.cleanup();

    this._unsubscribers.forEach((unsub) => unsub());
    this._unsubscribers = [];
  }

  subscribe(event, callback) {
    const unsubscribe = this._eventBus.on(event, callback.bind(this));
    this._unsubscribers.push(unsubscribe);
  }

  emitDOMEvent(eventName, detail = {}, options = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail,
        ...options,
      })
    );
  }

  emitGlobalEvent(eventName, detail = {}) {
    this._eventBus.emit(eventName, detail);
  }

  emit(eventName, detail = {}) {
    this.emitDOMEvent(eventName, detail);
    this.emitGlobalEvent(eventName, detail);
  }

  createStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    return style;
  }

  adoptGlobalStyles() {
    const globalVars = `
      :host {
        --black: #000;
        --white: #fff;
      }
    `;
    return this.createStyle(globalVars);
  }

  render() {
    throw new Error("render() must be implemented");
  }

  attachEventListeners() {
    // Override in child classes
  }

  cleanup() {
    // Override in child classes
  }
}
