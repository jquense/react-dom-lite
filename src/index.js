// @flow

import invariant from 'invariant';

import Root from './Root';
import { DOMLiteReconciler } from './Reconciler';

const ContainerMap: WeakMap<DOMContainer, Root> = new WeakMap();

const unstable_batchedUpdates = DOMLiteReconciler.batchedUpdates;

function render(
  elements: React$Element<any>,
  domContainer: DOMContainer,
  callback: ?Function,
) {
  let exitingRoot = ContainerMap.get(domContainer);
  if (exitingRoot) return exitingRoot.render(elements, callback);

  let root = new Root(domContainer, DOMLiteReconciler);
  ContainerMap.set(domContainer, root);
  // Initial render only is unbatched
  return DOMLiteReconciler.unbatchedUpdates(() =>
    root.render(elements, callback),
  );
}

function unmountComponentAtNode(domContainer: DOMContainer): boolean {
  invariant(
    domContainer && [1, 8, 9, 11].indexOf(domContainer.nodeType) !== -1,
    'unmountComponentAtNode(...): Target container is not a DOM element.',
  );

  const root = ContainerMap.get(domContainer);

  if (!root) return false;

  DOMLiteReconciler.unbatchedUpdates(() => {
    root.unmount(() => {
      ContainerMap.delete(domContainer);
    });
  });

  return true;
}

function findDOMNode(
  componentOrElement: Element | ?React$Component<any, any>,
): null | Element | Text {
  if (componentOrElement == null) return null;

  if (componentOrElement.nodeType === 1 || componentOrElement === 3) {
    return (componentOrElement: any);
  }

  return DOMLiteReconciler.findHostInstance(componentOrElement);
}

// FIXME: Upstream needs to provide a better API for this.
function createPortal(
  children: ReactNodeList,
  container: DOMContainer,
  key?: string,
): ReactPortal {
  return {
    $$typeof:
      typeof Symbol === 'function' && Symbol.for
        ? Symbol.for('react.portal')
        : 0xeaca,
    key: key == null ? null : String(key),
    children,
    containerInfo: container,
    implementation: null,
  };
}

export {
  render,
  unmountComponentAtNode,
  findDOMNode,
  createPortal,
  unstable_batchedUpdates,
};

// This is match react-dom which only has default exports
export default {
  render,
  unmountComponentAtNode,
  findDOMNode,
  createPortal,
  unstable_batchedUpdates,
};
