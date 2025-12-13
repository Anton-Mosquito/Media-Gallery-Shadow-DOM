import "../icon-button/icon-button.js";

const CHEVRON_LEFT_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E%3C/svg%3E";

const CHEVRON_RIGHT_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/%3E%3C/svg%3E";

const styles = `
  :host {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    margin-top: 32px;
  }

  .pagination__button {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #222;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pagination__button:hover:not(:disabled):not(.pagination__button--active) {
    border-color: #d1d5db;
    background: #f9fafb;
  }

  .pagination__button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  .pagination__button--active {
    background: #000;
    color: #fff;
    border-color: #000;
    font-weight: 500;
    cursor: default;
  }

  .pagination__ellipsis {
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 14px;
  }

  icon-button {
    --button-border-color: #e5e7eb;
    --icon-size: 18px;
  }

  icon-button:hover {
    --button-border-color: #d1d5db;
  }
`;

export class PaginationComponent extends HTMLElement {
  #shadow = null;
  #nav = null;
  #prevButton = null;
  #nextButton = null;
  #pagesContainer = null;
  #listeners = new Map();

  static get observedAttributes() {
    return ["current-page", "total-pages", "max-visible"];
  }

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "closed" });
  }

  get currentPage() {
    const value = parseInt(this.getAttribute("current-page") || "1", 10);
    return this.#validateNumber(value, 1);
  }

  set currentPage(value) {
    const validated = this.#validateNumber(value, 1);
    this.setAttribute("current-page", String(validated));
  }

  get totalPages() {
    const value = parseInt(this.getAttribute("total-pages") || "1", 10);
    return this.#validateNumber(value, 1);
  }

  set totalPages(value) {
    const validated = this.#validateNumber(value, 1);
    this.setAttribute("total-pages", String(validated));
  }

  get maxVisible() {
    const value = parseInt(this.getAttribute("max-visible") || "5", 10);
    return this.#validateNumber(value, 5);
  }

  set maxVisible(value) {
    const validated = this.#validateNumber(value, 5);
    this.setAttribute("max-visible", String(validated));
  }

  #validateNumber(value, defaultValue) {
    if (isNaN(value) || value < 1) {
      return defaultValue;
    }
    return Math.max(1, Math.floor(value));
  }

  connectedCallback() {
    this.#initializeDOM();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (!this.#nav) return;
    if (["current-page", "total-pages", "max-visible"].includes(name)) {
      this.#updatePagination();
    }
  }

  /**
   * Calculate which page numbers should be visible based on current page and total pages.
   * Uses a sliding window algorithm with ellipsis for large page counts.
   * @returns {Array<number|string>} Array of page numbers and "..." for ellipsis
   */
  #calculateVisiblePages() {
    const pages = [];
    const total = this.totalPages;
    const current = this.currentPage;
    const max = this.maxVisible;

    if (total <= max) {
      // Show all pages if total is less than max
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, current - 1);
      const end =
        current <= 3
          ? Math.min(max - 1, total - 1)
          : Math.min(total - 1, current + 1);

      // Adjust window if near the end
      if (current >= total - 2) {
        start = Math.max(2, total - (max - 2));
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < total - 1) {
        pages.push("...");
      }

      // Always show last page
      if (total > 1) {
        pages.push(total);
      }
    }

    return pages;
  }

  #goToPage(page) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.dispatchEvent(
        new CustomEvent("page-change", {
          detail: { page },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  #previousPage = () => {
    if (this.currentPage > 1) {
      this.#goToPage(this.currentPage - 1);
    }
  };

  #nextPage = () => {
    if (this.currentPage < this.totalPages) {
      this.#goToPage(this.currentPage + 1);
    }
  };

  #initializeDOM() {
    this.#shadow.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = styles;
    this.#shadow.appendChild(style);

    this.#nav = document.createElement("nav");
    this.#nav.className = "pagination";
    this.#nav.setAttribute("aria-label", "Pagination");

    this.#prevButton = this.#createPrevButton();
    this.#nav.appendChild(this.#prevButton);

    this.#pagesContainer = document.createElement("div");
    this.#pagesContainer.style.display = "contents";
    this.#nav.appendChild(this.#pagesContainer);

    this.#nextButton = this.#createNextButton();
    this.#nav.appendChild(this.#nextButton);

    this.#shadow.appendChild(this.#nav);

    this.#updatePagination();
  }

  #createPrevButton() {
    const prevButton = document.createElement("icon-button");
    prevButton.setAttribute("aria-label", "Previous page");

    const prevIcon = document.createElement("img");
    prevIcon.src = CHEVRON_LEFT_ICON;
    prevIcon.alt = "previous page";
    prevButton.appendChild(prevIcon);

    prevButton.addEventListener("icon-button-click", this.#previousPage);
    return prevButton;
  }

  #createNextButton() {
    const nextButton = document.createElement("icon-button");
    nextButton.setAttribute("aria-label", "Next page");

    const nextIcon = document.createElement("img");
    nextIcon.src = CHEVRON_RIGHT_ICON;
    nextIcon.alt = "next page";
    nextButton.appendChild(nextIcon);

    nextButton.addEventListener("icon-button-click", this.#nextPage);
    return nextButton;
  }

  #updatePagination() {
    this.#updateNavigationButtons();
    this.#updatePageButtons();
  }

  #updateNavigationButtons() {
    if (this.currentPage === 1) {
      this.#prevButton.setAttribute("disabled", "");
    } else {
      this.#prevButton.removeAttribute("disabled");
    }

    if (this.currentPage === this.totalPages) {
      this.#nextButton.setAttribute("disabled", "");
    } else {
      this.#nextButton.removeAttribute("disabled");
    }
  }

  #updatePageButtons() {
    this.#clearPageButtonListeners();
    this.#pagesContainer.innerHTML = "";

    const visiblePages = this.#calculateVisiblePages();

    visiblePages.forEach((page) => {
      if (page === "...") {
        const ellipsis = document.createElement("span");
        ellipsis.className = "pagination__ellipsis";
        ellipsis.textContent = "...";
        this.#pagesContainer.appendChild(ellipsis);
        return;
      }

      const button = this.#createPageButton(page);
      this.#pagesContainer.appendChild(button);
    });
  }

  #createPageButton(pageNumber) {
    const button = document.createElement("button");
    button.className = "pagination__button";
    button.textContent = String(pageNumber);

    if (pageNumber === this.currentPage) {
      button.classList.add("pagination__button--active");
      button.setAttribute("aria-current", "page");
    } else {
      const clickHandler = () => this.#goToPage(pageNumber);
      button.addEventListener("click", clickHandler);
      this.#listeners.set(button, clickHandler);
    }

    return button;
  }

  #clearPageButtonListeners() {
    this.#listeners.forEach((handler, element) => {
      element.removeEventListener("click", handler);
    });
    this.#listeners.clear();
  }

  disconnectedCallback() {
    this.#clearPageButtonListeners();

    if (this.#prevButton) {
      this.#prevButton.removeEventListener(
        "icon-button-click",
        this.#previousPage
      );
    }

    if (this.#nextButton) {
      this.#nextButton.removeEventListener("icon-button-click", this.#nextPage);
    }
  }
}

customElements.define("pagination-component", PaginationComponent);
