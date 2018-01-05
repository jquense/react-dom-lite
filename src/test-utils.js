// @flow

import { render } from './';
import * as Events from './events';
import SyntheticEvent from './events/SyntheticEvent';

export function renderIntoDetachedNode(children: React$Element<any>) {
  const div = document.createElement('div');
  return render(children, div);
}

export const SimulateNative = new Proxy(
  {},
  {
    get(target, eventName) {
      eventName = eventName.toLowerCase();

      return (domNode: Element, eventData: any) => {
        const nativeEvent = new Event(eventName);
        domNode.dispatchEvent(Object.assign(nativeEvent, eventData));
      };
    },
  },
);

export const Simulate = new Proxy(
  {},
  {
    get(target, eventName) {
      eventName = eventName.toLowerCase();

      return (domNode: Element, eventData: any) => {
        const nativeEvent = new Event(
          eventName === 'change' ? 'input' : eventName,
        );
        Object.defineProperty(nativeEvent, 'target', {
          value: domNode,
          enumerable: true,
        });
        const event = new SyntheticEvent(nativeEvent, eventName);
        Events.dispatchSyntheticEvent(domNode, Object.assign(event, eventData));
      };
    },
  },
);
