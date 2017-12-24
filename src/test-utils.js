// @flow

import { render } from './';

export function renderIntoDetachedNode(children: React$Element<any>) {
  const div = document.createElement('div');
  return render(children, div);
}
