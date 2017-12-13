class Root {
  constructor(domRoot, renderer) {
    this.renderer = renderer;
    this.internalRoot = domRoot;
  }

  render(children) {
    this.renderer.updateContainer(children, this.internalRoot, null);
  }

  unmount() {
    this.renderer.updateContainer(null, this.internalRoot, null);
  }
}

export default Root;
