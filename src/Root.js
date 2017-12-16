// @flow

import type { Reconciler } from './reconciler-types';

class Root {
  renderer: Reconciler;
  internalRoot: any; // TODO: Needs attention!

  constructor(
    domRoot: DOMContainer & { internalRoot: any },
    renderer: Reconciler
  ) {
    this.renderer = renderer;
    this.internalRoot = domRoot;
  }

  render(children: React$Element<any>) {
    this.renderer.updateContainer(children, this.internalRoot, null);
  }

  unmount() {
    this.renderer.updateContainer(null, this.internalRoot, null);
  }
}

export default Root;
