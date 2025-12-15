// src/common/router.js
export class Router {
  constructor(routes, appState, fallbackRoute = "") {
    this.routes = routes;
    this.appState = appState;
    this.fallbackRoute = fallbackRoute;
    this.currentView = null;
  }

  init() {
    window.addEventListener("hashchange", () => this.route());
    this.route();
  }

  async route() {
    const hash = window.location.hash || "";
    const route = this.routes.find((r) => r.path === hash);

    if (!route) {
      console.warn(`Route "${hash}" not found`);
      window.location.hash = this.fallbackRoute;
      return;
    }

    const rootElement = document.getElementById("root");

    if (this.currentView) {
      rootElement.classList.add("page-transition-exit");
      await this.wait(200);

      if (this.currentView?.destroy) {
        this.currentView.destroy();
      }

      rootElement.classList.remove("page-transition-exit");
    }

    this.currentView = new route.view(this.appState);

    rootElement.classList.add("page-transition-enter");
    this.currentView.render();

    await this.wait(300); // Чекаємо завершення анімації входу
    rootElement.classList.remove("page-transition-enter");

    return this.currentView;
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }
}
