import { AbstractView } from "../../common/view";
import onChange from "on-change";
import { Header } from "../../components/header/header";

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
    this.app.innerHTML = "";
    this.app.append(main);
    this.renderHeader();
    this.appState.favorites.push("Example Book");
  }

  renderHeader() {
    const header = new Header(this.appState);
    header.render();
    this.app.prepend(header.element);
  }
}
