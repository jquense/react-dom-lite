// @flow

const returnsFalse = () => false;
const returnsTrue = () => true;

/**
 * Called SyntheticEvent for lack of a better name. This is really a
 * Shim object for compatibility with react components expecting the
 * Synthetic even system to exist.
 */
export default class SyntheticEvent {
  type: string;
  defaultPrevented: boolean;
  isPersistent: Function;
  isDefaultPrevented: Function;
  isPropagationStopped: Function;
  eventPhase: number;
  currentTarget: Element | Text;
  nativeEvent: Event;

  constructor(event: Event) {
    this.nativeEvent = event;
    this.type = event.type;
    this.isPropagationStopped = returnsFalse;
    this.isDefaultPrevented = event.defaultPrevented
      ? returnsTrue
      : returnsFalse;

    for (let key in event) {
      if (!(key in this))
        // $FlowFixMe
        this[key] = event[key];
    }
  }
  persist() {
    this.isPersistent = returnsTrue;
  }
  isPersistent() {
    return false;
  }
  stopPropagation = () => {
    this.nativeEvent.stopPropagation();
    this.isPropagationStopped = returnsTrue;
  };
  preventDefault = () => {
    this.defaultPrevented = true;
    this.isDefaultPrevented = returnsTrue;
    this.nativeEvent.preventDefault();
  };
}
