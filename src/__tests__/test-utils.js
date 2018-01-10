import React from 'react';

import { render } from 'react-dom-lite';
import * as TestUtils from 'react-dom-lite/test-utils';

describe('test-utils', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should dispatch synthetic events directly', () => {
    const captureSpy = jest.fn(e => {
      expect(bubbleSpy).not.toBeCalled();
      expect(e.eventPhase).toEqual(e.CAPTURING_PHASE);
    });
    const bubbleSpy = jest.fn(e =>
      expect(e.eventPhase).toEqual(e.BUBBLING_PHASE),
    );
    const node = render(
      <div onClick={bubbleSpy} onClickCapture={captureSpy}>
        <button />
      </div>,
      container,
    );

    TestUtils.Simulate.click(node.firstChild);

    expect(captureSpy).toBeCalled();
    expect(bubbleSpy).toBeCalled();
  });

  it('should skip some mapping from native to synthetic', () => {
    const changeSpy = jest.fn();
    const inputSpy = jest.fn();

    const node = render(
      <div>
        <input type="text" onChange={changeSpy} onInput={inputSpy} />
      </div>,
      container,
    );

    TestUtils.Simulate.change(node.firstChild);

    expect(changeSpy).toBeCalled();
    expect(inputSpy).not.toBeCalled();
  });

  it('should mimic dispatching a native event', () => {
    const changeSpy = jest.fn();
    const inputSpy = jest.fn();

    const node = render(
      <div>
        <input type="text" onChange={changeSpy} onInput={inputSpy} />
      </div>,
      container,
    );

    TestUtils.SimulateNative.change(node.firstChild);
    expect(changeSpy).not.toBeCalled();

    TestUtils.SimulateNative.input(node.firstChild);
    expect(changeSpy).toBeCalled();
    expect(inputSpy).toBeCalled();
  });
});
