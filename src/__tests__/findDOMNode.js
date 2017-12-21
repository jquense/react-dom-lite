/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { render, unmountComponentAtNode, findDOMNode } from 'react-dom-lite';
import * as TestUtils from 'react-dom-lite/test-utils';

describe('findDOMNode', () => {
  it('findDOMNode should return null if passed null', () => {
    expect(findDOMNode(null)).toBe(null);
  });

  it('findDOMNode should find dom element', () => {
    class MyNode extends React.Component {
      render() {
        return (
          <div>
            <span>Noise</span>
          </div>
        );
      }
    }

    const myNode = TestUtils.renderIntoDetachedNode(<MyNode />);
    const myDiv = findDOMNode(myNode);
    const mySameDiv = findDOMNode(myDiv);
    expect(myDiv.tagName).toBe('DIV');
    expect(mySameDiv).toBe(myDiv);
  });

  it('findDOMNode should find dom element after an update from null', () => {
    function Bar({ flag }) {
      if (flag) {
        return <span>A</span>;
      }
      return null;
    }
    class MyNode extends React.Component {
      render() {
        return <Bar flag={this.props.flag} />;
      }
    }

    const container = document.createElement('div');

    const myNodeA = render(<MyNode />, container);
    const a = findDOMNode(myNodeA);
    expect(a).toBe(null);

    const myNodeB = render(<MyNode flag={true} />, container);
    expect(myNodeA === myNodeB).toBe(true);

    const b = findDOMNode(myNodeB);
    expect(b.tagName).toBe('SPAN');
  });

  it('findDOMNode should reject random objects', () => {
    expect(function() {
      findDOMNode({ foo: 'bar' });
    }).toThrowError(
      'Element appears to be neither ReactComponent nor DOMNode. Keys: foo'
    );
  });

  it('findDOMNode should reject unmounted objects with render func', () => {
    class Foo extends React.Component {
      render() {
        return <div />;
      }
    }

    const container = document.createElement('div');
    const inst = render(<Foo />, container);
    unmountComponentAtNode(container);

    expect(() => findDOMNode(inst)).toThrowError(
      'Unable to find node on an unmounted component.'
    );
  });

  it('findDOMNode should not throw an error when called within a component that is not mounted', () => {
    class Bar extends React.Component {
      componentWillMount() {
        expect(findDOMNode(this)).toBeNull();
      }

      render() {
        return <div />;
      }
    }

    expect(() => TestUtils.renderIntoDetachedNode(<Bar />)).not.toThrow();
  });
});
