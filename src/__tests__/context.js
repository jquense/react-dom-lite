/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { render } from 'react-dom-lite';

describe('Context', () => {
  it('Context must be available in the consumer', () => {
    let actual = 0;
    const Context = React.createContext();

    function Consumer() {
      return (
        <Context.Consumer>
          {value => {
            actual = value;
            return <span prop={'Result: ' + value} />;
          }}
        </Context.Consumer>
      );
    }

    class MyNode extends React.Component {
      render() {
        return (
          <div>
            <span>Noise</span>
            <Consumer />
          </div>
        );
      }
    }

    const container = document.createElement('div');
    render(
      <Context.Provider value={5}>
        <MyNode />
      </Context.Provider>,
      container,
      function() {
        expect(actual).toBe(5);
      },
    );
  });
});
