import { AbstractView } from "../../common/view";

export class MainView extends AbstractView {
  constructor() {
    super();
    this.setTitle("Search books");
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
  }
}
