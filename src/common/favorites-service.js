export class FavoritesService {
  static add(appState, book) {
    const exists = appState.favorites.find((b) => b.key === book.key);
    if (!exists) {
      appState.favorites = [...appState.favorites, book];
    }
  }

  static remove(appState, book) {
    appState.favorites = appState.favorites.filter((b) => b.key !== book.key);
  }

  static toggle(appState, book, isFavorite) {
    if (isFavorite) {
      this.add(appState, book);
    } else {
      this.remove(appState, book);
    }
  }
}
