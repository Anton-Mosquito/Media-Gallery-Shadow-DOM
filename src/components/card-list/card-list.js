import { DivComponent } from "../../common/div-component";
import { Card } from "../card/card";
import "./card-list.css";

export class CardList extends DivComponent {
  constructor(appState, parentState) {
    super();
    this.appState = appState;
    this.parentState = parentState;
  }

  render() {
    if (this.parentState.loading) {
      this.element.innerHTML = `<div class="card_list__loader">Loading...</div>`;
      return this.element;
    }

    const cardGrid = document.createElement("div");
    cardGrid.classList.add("card_grid");
    this.element.append(cardGrid);
    for (const card of this.parentState.list) {
      cardGrid.append(new Card(this.appState, card).render());
    }
    return this.element;
  }
}
