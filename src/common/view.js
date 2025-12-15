import onChange from "on-change";
import { eventBus } from "./event-bus.js";

/**
 * Base class for all views with automatic lifecycle management
 * Features:
 * - Automatic onChange subscription/cleanup
 * - Automatic EventBus subscription/cleanup
 * - Centralized header rendering logic
 * - Helper methods for DOM manipulation
 */
export class AbstractView {
  // Private fields for automatic cleanup
  #changeListeners = [];
  #eventSubscriptions = new Map();
  #elements = {};

  /**
   * @param {Object} appState - Application state object
   */
  constructor(appState) {
    this.app = document.getElementById("root");
    this.appState = appState;

    // Automatically setup onChange for appState if provided
    if (this.appState) {
      this.appState = onChange(this.appState, this.onAppStateChange.bind(this));
      this.#changeListeners.push({
        obj: this.appState,
        handler: this.onAppStateChange,
      });
    }
  }

  /**
   * Subscribe to EventBus event with automatic cleanup
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  subscribe(event, handler) {
    eventBus.on(event, handler);
    this.#eventSubscriptions.set(event, handler);
  }

  /**
   * Initialize local state with onChange reactivity
   * @param {Object} initialState - Initial state object
   * @param {Function} handler - State change handler
   * @returns {Proxy} Proxied state object
   */
  initLocalState(initialState, handler) {
    const state = onChange(initialState, handler.bind(this));
    this.#changeListeners.push({ obj: state, handler });
    return state;
  }

  /**
   * Hook called when appState changes
   * Override in child classes to react to state changes
   * @param {string} path - Changed property path
   */
  onAppStateChange(path) {
    if (path === "favorites") {
      this.updateHeader();
    }
  }

  /**
   * Render view with automatic header injection
   * @param {HTMLElement} content - Main content element
   */
  renderWithHeader(content) {
    this.app.innerHTML = "";

    if (this.hasHeader !== false) {
      this.#elements.header = document.createElement("header-component");
      this.updateHeader();
      this.app.appendChild(this.#elements.header);
    }

    this.app.appendChild(content);
  }

  /**
   * Update header with current favorites count
   * Called automatically when appState.favorites changes
   */
  updateHeader() {
    if (!this.#elements.header || !this.appState) return;

    this.setAttribute(
      this.#elements.header,
      "favorites-count",
      this.appState.favorites?.length || 0
    );
  }

  /**
   * Safely set element attribute with automatic type conversion
   * @param {HTMLElement} element - Target element
   * @param {string} name - Attribute name
   * @param {*} value - Attribute value
   */
  setAttribute(element, name, value) {
    if (!element) return;
    element.setAttribute(name, String(value));
  }

  /**
   * Create element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {Array} children - Child elements or text
   * @returns {HTMLElement}
   */
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      this.setAttribute(element, key, value);
    });

    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    });

    return element;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use constructor with appState instead
   */
  async getHtml() {
    throw new Error("getHtml() must be implemented by subclass");
  }

  /**
   * Set document title
   * @param {string} title - Page title
   */
  setTitle(title) {
    document.title = title;
  }

  /**
   * Render view content
   * Override in child classes
   */
  render() {
    return;
  }

  /**
   * Cleanup all subscriptions and listeners
   * Called automatically by router on view change
   */
  destroy() {
    // Unsubscribe from all onChange listeners
    this.#changeListeners.forEach(({ obj }) => {
      try {
        onChange.unsubscribe(obj);
      } catch (error) {
        console.warn("Error unsubscribing from onChange:", error);
      }
    });
    this.#changeListeners = [];

    // Unsubscribe from all EventBus subscriptions
    this.#eventSubscriptions.forEach((handler, event) => {
      try {
        eventBus.off(event, handler);
      } catch (error) {
        console.warn("Error unsubscribing from EventBus:", error);
      }
    });
    this.#eventSubscriptions.clear();

    // Clear elements references
    this.#elements = {};
  }
}
