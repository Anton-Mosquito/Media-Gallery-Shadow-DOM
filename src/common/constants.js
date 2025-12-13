// src/common/constants.js

/**
 * Application-wide event names
 * Централізоване сховище подій для EventBus
 */
export const EVENTS = {
  SEARCH: "search",
  FAVORITE_TOGGLE: "favorite-toggle",
  OPEN_FILM: "open-film",
  PAGE_CHANGE: "page-change",
};

/**
 * UI Icons (SVG data URLs)
 */
export const ICONS = {
  CHEVRON_LEFT:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E%3C/svg%3E",
  CHEVRON_RIGHT:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'/%3E%3C/svg%3E",
};

/**
 * UI Placeholders and common text
 */
export const PLACEHOLDERS = {
  IMAGE: "/static/placeholder.png",
  TEXT: "-",
  LOADING: "Loading...",
  TITLE: "Untitled",
  EMPTY: "&nbsp;",
};

/**
 * Labels for UI elements
 */
export const LABELS = {
  ADD_TO_FAVORITES: "Add to favorites",
  REMOVE_FROM_FAVORITES: "Remove from favorites",
  NO_DATA: "N/A",
};

/**
 * Film detail constants (legacy, можна мігрувати окремо)
 */
export const FILM_DETAIL_CONSTANTS = {
  PLACEHOLDER: PLACEHOLDERS,
  NO_DATA: LABELS.NO_DATA,
  LABELS: {
    ADD_TO_FAVORITES: LABELS.ADD_TO_FAVORITES,
    REMOVE_FROM_FAVORITES: LABELS.REMOVE_FROM_FAVORITES,
  },
};
