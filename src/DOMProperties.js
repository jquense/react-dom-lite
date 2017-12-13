import hyphenate from 'dom-helpers/util/hyphenate';

export const RESERVED_PROPS = {
  children: true,
  dangerouslySetInnerHTML: true,
  innerHTML: true
};

export const isEventRegex = /^on([A-Z][a-zA-Z]+)$/;

const HAS_STRING_BOOLEAN_VALUE = 0x40;

const properties = {
  contentEditable: HAS_STRING_BOOLEAN_VALUE,
  draggable: HAS_STRING_BOOLEAN_VALUE,
  spellCheck: HAS_STRING_BOOLEAN_VALUE,
  value: HAS_STRING_BOOLEAN_VALUE
};

export function setValueOnElement(domElement, propName, value) {
  if (RESERVED_PROPS.hasOwnProperty(propName)) return;

  if (propName in domElement) {
    domElement[propName] = value == null ? '' : value;
    return;
  }

  const attributeName = hyphenate(propName);
  if (value == null) {
    domElement.removeAttribute(attributeName);
  } else {
    if (properties[propName] === HAS_STRING_BOOLEAN_VALUE) {
      value = String(value);
    } else if (value === true) {
      value = '';
    }

    domElement.setAttribute(attributeName, value);
  }
}
