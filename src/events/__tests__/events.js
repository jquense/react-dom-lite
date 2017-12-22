import React from 'react';
import { render } from 'react-dom-lite';

describe('events', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should listen to events', () => {
    const focusSpy = jest.fn();
    const bubbleSpy = jest.fn(e =>
      expect(e.eventPhase).toEqual(e.BUBBLING_PHASE)
    );
    const captureSpy = jest.fn(e =>
      expect(e.eventPhase).toEqual(e.CAPTURING_PHASE)
    );
    const node = render(
      <div onFocus={focusSpy} onClick={bubbleSpy} onClickCapture={captureSpy}>
        <button />
      </div>,
      container
    );

    node.firstChild.click();
    node.firstChild.focus();

    expect(bubbleSpy).toBeCalled();
    expect(captureSpy).toBeCalled();
    expect(focusSpy).toBeCalled();
  });

  test('onFocus and onBlur should bubble', () => {
    const focusSpy = jest.fn();
    const blurSpy = jest.fn();
    const node = render(
      <div onFocus={focusSpy} onBlur={blurSpy}>
        <input />
      </div>,
      container
    );

    node.firstChild.focus();
    node.firstChild.blur();

    expect(focusSpy).toBeCalled();
    expect(blurSpy).toBeCalled();
  });

  it('should stop propagation', () => {
    const btnSpy = jest.fn(e => {
      e.stopPropagation();
      expect(e.isPropagationStopped()).toEqual(true);
    });
    const spy = jest.fn();

    const node = render(
      <div onClick={spy}>
        <button onClick={btnSpy} />
      </div>,
      container
    );

    node.firstChild.click();

    expect(btnSpy).toBeCalled();
    expect(spy).not.toBeCalled();
  });

  it('should have synthetic event api', () => {
    let event;
    const node = render(
      <button onClick={jest.fn(e => (event = e))} />,
      container
    );

    node.click();

    expect(event.isPersistent()).toEqual(false);
    event.persist();
    expect(event.isPersistent()).toEqual(true);
  });

  it('should preventDefault', () => {
    const btnSpy = jest.fn(e => {
      expect(e.defaultPrevented).toEqual(false);
      expect(e.nativeEvent.defaultPrevented).toEqual(false);
      expect(e.isDefaultPrevented()).toEqual(false);
      e.preventDefault();
    });

    const spy = jest.fn(e => {
      expect(e.defaultPrevented).toEqual(true);
      expect(e.isDefaultPrevented()).toEqual(true);
    });

    const node = render(
      <div onClick={spy}>
        <button onClick={btnSpy} />
      </div>,
      container
    );

    node.firstChild.click();

    expect(btnSpy).toBeCalled();
    expect(spy).toBeCalled();
  });

  describe('Alternate types', () => {
    it('should use original name in event', () => {
      const spy = jest.fn(e => {
        expect(e.type).toEqual('change');
        expect(e.nativeEvent.type).toEqual('input');
      });
      const node = render(<input onChange={spy} />, container);

      node.dispatchEvent(new Event('input', {}));

      expect(spy).toBeCalled();
    });
  });
});
