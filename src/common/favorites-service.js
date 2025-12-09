export class FavoritesService {
  static add(appState, film) {
    const exists = appState.favorites.find(({ id }) => id === film.id);
    if (!exists) {
      appState.favorites = [...appState.favorites, film];
    }
  }

  static remove(appState, film) {
    appState.favorites = appState.favorites.filter(({ id }) => id !== film.id);
  }

  static toggle(appState, film, isFavorite) {
    if (isFavorite) {
      this.add(appState, film);
    } else {
      this.remove(appState, film);
    }
  }
}
