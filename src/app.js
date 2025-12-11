import { Router } from "./common/router";
import { MainView } from "./views/main/main";
import { FavoritesView } from "./views/favorites/favorites";
import { DetailView } from "./views/detail/detail";

class App {
  appState = {
    favorites: [],
    selectedFilmId: null,
  };

  constructor() {
    const routes = [
      { path: "", view: MainView },
      { path: "#favorites", view: FavoritesView },
      { path: "#detail", view: DetailView },
    ];

    this.router = new Router(routes, this.appState, "");
    this.router.init();
  }
}

new App();
export default App;
