export class AbstractView {
  constructor() {
    this.app = document.getElementById("root");
  }

  async getHtml() {
    throw new Error("getHtml() must be implemented by subclass");
  }

  setTitle(title) {
    document.title = title;
  }

  render() {
    return;
  }

  destroy() {
    return;
  }
}
