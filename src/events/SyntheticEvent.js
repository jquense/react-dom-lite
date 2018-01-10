// @flow

const returnsFalse = () => false;
const returnsTrue = () => true;

/**
 * Called SyntheticEvent for lack of a better name. This is really a
 * Shim object for compatibility with react components expecting the
 * Synthetic even system to exist.
 */
export default function SyntheticEvent(event: Event, type?: string) {
  this.nativeEvent = event;
  this.type = type || event.type;

  for (let key in event)
    if (!(key in this)) {
      this[key] = (event: any)[key]; // TODO maybe normalize `event.key`
    }

  this.isPersistent = returnsFalse;
  this.isPropagationStopped = returnsFalse;
  this.isDefaultPrevented = event.defaultPrevented ? returnsTrue : returnsFalse;
}

SyntheticEvent.prototype.persist = function() {
  this.isPersistent = returnsTrue;
};
SyntheticEvent.prototype.stopPropagation = function() {
  this.nativeEvent.stopPropagation();
  this.isPropagationStopped = returnsTrue;
};
SyntheticEvent.prototype.preventDefault = function() {
  this.defaultPrevented = true;
  this.isDefaultPrevented = returnsTrue;
  this.nativeEvent.preventDefault();
};
