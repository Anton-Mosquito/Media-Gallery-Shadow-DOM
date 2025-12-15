import { DivComponent } from "../../common/div-component";
import "./header.css";

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
		<img src="/static/cinema.svg" alt="Logo" />
	 </div>
			<div class="menu">
				<a class="menu__item" href="#">
					<img src="/static/search.svg" alt="Search icon" />
					Search books
				</a>
				<a class="menu__item" href="#favorites">
					<img src="/static/favorite.svg" alt="Favorites icon" />
					Favorites
					<div class="menu__counter">
						${this.appState.favorites.length}
					</div>
				</a>
			</div>
    `;
    return this.element;
  }
}
