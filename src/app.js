import { MainView } from "./views/main/main";

class App {
  routes = [{ path: "/", view: MainView }];
  appState = {
    favorites: [],
  };

  constructor() {
    window.addEventListener("hashchange", this.route.bind(this));
    this.route();
  }

  route() {
    if (this.currentView) {
      this.currentView.destroy();
    }
    const view =
      this.routes.find((r) => r.path === window.location.hash) ||
      this.routes[0];
    this.currentView = new view.view(this.appState);
    this.currentView.render();
  }
}

new App();
export default App;
