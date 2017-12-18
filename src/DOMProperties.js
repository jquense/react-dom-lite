// @flow

import hyphenate from 'dom-helpers/util/hyphenate';

import {
  isNamespaced,
  ReservedPropNames,
  MapPropertyToAttribute,
  MapNamespaceToUri,
} from './DOMConfig';

/**
 * A string attribute that accepts react boolean values. The rendered
 * value should be "true" or "false",
 * e.g `<input value="true" />` not `<input value />`
 */
const isStringBoolean = (key: string) =>
  key === 'contenteditable' ||
  key === 'draggable' ||
  key === 'spellcheck' ||
  key === 'value';

export function setValueOnElement(
  domElement: Element,
  propName: string,
  value: any,
  isSvg: boolean,
) {
  if (ReservedPropNames.has(propName)) return;

  if (
    !isSvg &&
    propName !== 'list' &&
    propName !== 'type' &&
    propName in domElement
  ) {
    (domElement: any)[propName] = value == null ? '' : value;
    return;
  }

  let ns = isSvg && propName.match(isNamespaced);
  if (ns) {
    ns = MapNamespaceToUri[ns[1]];
    propName = propName.replace(isNamespaced, '').toLowerCase();
  }

  // manually map inconsistent attribute names from consistent prop names,
  // otherwise assume it's predictably camelCase to dash-case
  const attributeName = MapPropertyToAttribute[propName] || hyphenate(propName);

  if (value == null) {
    if (ns) domElement.removeAttributeNS(ns, attributeName);
    else domElement.removeAttribute(attributeName);
  } else {
    if ((value === true || value === false) && isStringBoolean(attributeName)) {
      value = String(value);
    } else if (value === true) {
      value = '';
    }

    if (ns) domElement.setAttributeNS(ns, attributeName, value);
    else domElement.setAttribute(attributeName, value);
  }
}
