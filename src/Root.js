// @flow

import type { OpaqueRoot, Reconciler } from 'react-reconciler';

type DOMLiteRenderer = Reconciler<DOMContainer, Element, Text>;

class Root {
  renderer: DOMLiteRenderer;
  internalRoot: OpaqueRoot;

  constructor(domContainer: DOMContainer, renderer: DOMLiteRenderer) {
    this.renderer = renderer;
    this.internalRoot = renderer.createContainer(domContainer, false, false);
  }

  render(children: ReactNodeList, cb: ?Function) {
    this.renderer.updateContainer(children, this.internalRoot, null, cb);

    return this.renderer.getPublicRootInstance(this.internalRoot);
  }

  unmount(cb: ?Function) {
    this.renderer.updateContainer(null, this.internalRoot, null, cb);
  }
}

export default Root;
