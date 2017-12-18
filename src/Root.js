// @flow

import type { OpaqueRoot } from 'react-reconciler';
import { DOMLiteRenderer } from './index';

class Root {
  renderer: typeof DOMLiteRenderer;
  internalRoot: OpaqueRoot;

  constructor(domRoot: DOMContainer, renderer: typeof DOMLiteRenderer) {
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
