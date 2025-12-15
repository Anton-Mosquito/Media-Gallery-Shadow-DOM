export class DivComponent {
  constructor(textContent = "", className = "") {
    this.element = document.createElement("div");
    // this.element.textContent = textContent;
    // if (className) {
    //   this.element.className = className;
    // }
  }

  render() {
    this.element.textContent = "This is a div component";
    document.body.appendChild(this.element);
  }

  setText(text) {
    this.element.textContent = text;
  }

  setClass(className) {
    this.element.classList.add(className);
  }

  getElement() {
    return this.element;
  }
}
