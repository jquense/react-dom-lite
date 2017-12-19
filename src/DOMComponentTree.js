// @flow

import type { OpaqueHandle } from 'react-reconciler';

export const HostComponent = 5;
export const HostText = 6;

const ComponentInstanceMap: WeakMap<
  Element | Text,
  OpaqueHandle
> = new WeakMap();

export function cacheHandleByInstance(
  instance: Element,
  internalHandle: OpaqueHandle
) {
  ComponentInstanceMap.set(instance, internalHandle);
}

export function getInternalHandleFromInstance(
  instance: Element | Text
): ?OpaqueHandle {
  if (ComponentInstanceMap.has(instance)) {
    return ComponentInstanceMap.get(instance);
  }

  // Walk up the tree until we find an ancestor whose instance we have cached.
  let element = instance;
  while (!ComponentInstanceMap.has(element)) {
    if (!element.parentElement) return null;
    element = element.parentElement;
  }

  return ComponentInstanceMap.get(element) || null;
}
