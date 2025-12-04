import { AbstractView } from "../../common/view";
import onChange from "on-change";
import { Header } from "../../components/header/header";
import { Search } from "../../components/search/search";
import { CardList } from "../../components/card-list/card-list";

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
    this.state = onChange(this.state, this.stateHook.bind(this));
    this.setTitle("Search books");
  }

  appStateHook(path, value) {
    if (path === "favorites") {
      console.log(value);
    }
  }

  async loadList(query, offset = 0) {
    // const response = await fetch(
    //   `https://www.googleapis.com/books/v1/volumes?q=${
    //     this.state.searchQuery || "flowers"
    //   }&startIndex=${this.state.offset}&maxResults=10`
    // );
    const response = await fetch(
      `https://openLibrary.org/search.json?q=${query}&offset=${offset}&limit=10`
    );
    return response.json();
    // const data = await response.json();
    // this.state.list = [...this.state.list, ...data.items];
    // this.state.loading = false;
  }

  async stateHook(path) {
    if (path === "searchQuery") {
      this.state.loading = true;
      const data = await this.loadList(
        this.state.searchQuery,
        this.state.offset
      );
      this.state.list = [...this.state.list, ...data.docs];
      this.state.loading = false;
    }

    if (path === "list" || path === "loading") {
      this.render();
    }
  }

  render() {
    const main = document.createElement("main");
    main.append(new Search(this.state).render());
    main.append(new CardList(this.appState, this.state).render());
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
