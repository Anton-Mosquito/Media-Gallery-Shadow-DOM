import { DivComponent } from "../../common/div-component";

export class Header extends DivComponent {
  constructor(appState) {
    super("", "header");
    this.appState = appState;
  }

  render() {
    this.element.innerHTML = "";
    this.setClass("header");
    this.element.innerHTML = `
      <div>
       <img src="static/cinema.svg" alt="Logo" />
      </div>
      <p>Favorites: ${this.appState.favorites.length}</p>
    `;
    return this.element;
  }
}
