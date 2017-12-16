import React from 'react';
import { render } from '../';

describe('ReactDOMLite', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should render', () => {
    render(<div />, container);

    expect(container).toMatchSnapshot();
  });
});
