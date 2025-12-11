export class FavoritesService {
  static add(appState, film) {
    const exists = appState.favorites.find(
      ({ imdbID }) => imdbID === film.imdbID
    );
    if (!exists) {
      appState.favorites = [...appState.favorites, film];
    }
  }

  static remove(appState, film) {
    appState.favorites = appState.favorites.filter(
      ({ imdbID }) => imdbID !== film.imdbID
    );
  }

  static toggle(appState, film, isFavorite) {
    if (isFavorite) {
      this.add(appState, film);
    } else {
      this.remove(appState, film);
    }
  }
}
