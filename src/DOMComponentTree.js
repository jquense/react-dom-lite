// @flow

import type { OpaqueHandle } from 'react-reconciler';

const HostComponent = 5;
const HostText = 6;

type PublicInstance = PublicInstance;

const ComponentInstanceMap: WeakMap<
  PublicInstance,
  OpaqueHandle
> = new WeakMap();

export function cacheHandleByInstance(
  instance: Element,
  internalHandle: OpaqueHandle
) {
  ComponentInstanceMap.set(instance, internalHandle);
}

export function getInternalHandleFromInstance(
  instance: PublicInstance
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

  const inst = ComponentInstanceMap.get(element);
  if (inst && (inst.tag === HostComponent || inst.tag === HostText)) {
    return inst;
  }
  return null;
}

export function collectAncestors(inst: PublicInstance): Array<PublicInstance> {
  let handle = ComponentInstanceMap.get(inst);
  const path: Array<PublicInstance> = [];
  while (handle) {
    path.push(inst);
    do {
      handle = handle.return;
    } while (handle && handle.tag !== HostComponent);
    inst = handle && handle.stateNode;
  }
  return path;
}
