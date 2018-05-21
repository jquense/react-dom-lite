// @flow

import type { OpaqueRoot, Reconciler } from 'react-reconciler';

type DOMLiteRenderer = Reconciler<DOMContainer, Element, Text>;

class Root {
  renderer: DOMLiteRenderer;
  internalRoot: OpaqueRoot;

  constructor(
    domContainer: DOMContainer,
    renderer: DOMLiteRenderer,
    isAsync: boolean,
    hydrate: boolean,
  ) {
    this.renderer = renderer;
    this.internalRoot = renderer.createContainer(
      domContainer,
      isAsync,
      hydrate,
    ); // Attention: react-reconciler on npm doesn't support async yet. I don't think I should raise an issue upstream given that they have a release cycle planned. It would be nice though that npm know which git tag library authors should refer to.
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
