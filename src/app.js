import { Router } from "./common/router";
import { MainView } from "./views/main/main";
import { FavoritesView } from "./views/favorites/favorites";

class App {
  appState = {
    favorites: [],
  };

  constructor() {
    const routes = [
      { path: "", view: MainView },
      { path: "#favorites", view: FavoritesView },
      { path: "#book", view: FavoritesView },
    ];

    this.router = new Router(routes, this.appState, "");
    this.router.init();
  }
}

new App();
export default App;
