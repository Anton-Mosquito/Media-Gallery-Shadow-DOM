import { AbstractView } from "../../common/view";
import onChange from "on-change";

export class MainView extends AbstractView {
  state = {
    list: [],
    loading: false,
    searchQuery: undefined,
    offset: 0,
  };
  constructor(appState) {
    super();
    this.appState = appState;
    this.appState = onChange(this.appState, this.appStateHook.bind(this));
    this.setTitle("Search books");
  }

  appStateHook(path, value) {
    if (path === "favorites") {
      console.log(value);
    }
  }

  render() {
    const main = document.createElement("main");
    main.innerHTML = `
        <h1>Search for Books</h1>
        <form id="search-form">
          <input type="text" id="search-input" placeholder="Enter book title or author" required />
          <button type="submit">Search</button>
        </form>
        <div id="results"></div>
      `;
    this.app.innerHTML = "";
    this.app.append(main);
    this.appState.favorites.push("Example Book");
  }
}
