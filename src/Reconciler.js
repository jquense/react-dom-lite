// @flow

import Reconciler from 'react-reconciler';
// Caution! One one of the following modules is supposed to be imported. Avoid side effects in them.
import * as HostConfigDev from './HostConfigDev.js';
import * as HostConfigProd from './HostConfigProd.js';
import { getInternalHandleFromInstance } from './DOMComponentTree';

function getHostConfig() {
  if (__DEV__) {
    return HostConfigDev;
  } else {
    return HostConfigProd;
  }
}

const DOMLiteReconciler = Reconciler(getHostConfig());

DOMLiteReconciler.injectIntoDevTools({
  bundleType: __DEV__ ? 1 : 0,
  version: '0.1.0',
  rendererPackageName: 'react-dom-lite',
  findFiberByHostInstance: getInternalHandleFromInstance,
});

export { DOMLiteReconciler };
