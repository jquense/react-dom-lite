import React, { useState } from 'react';
import * as DomLite from 'react-dom-lite';

class Counter extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { count: 0 };
  }
  handleCount() {
    this.setState(({ count }) => {
      return {
        count: count + 1,
      };
    });
  }

  render() {
    return (
      <div>
        <span style={{ color: 'red' }} draggable={true}>
          count:
        </span>
        <strong className="foo">{` ${this.state.count}`}</strong>
        <br />
        <button type="button" onClick={() => this.handleCount()}>
          Click
        </button>

        <Form />
      </div>
    );
  }
}

class Select extends React.Component {
  state = { value: 3 };
  handleChange = (e) => {
    this.setState({ value: e.target.value });
  };
  render() {
    return (
      <select value={this.state.value} onChange={this.handleChange}>
        <option value={1}>foo 1</option>
        <option value={2}>foo 2</option>
        <option value={3}>foo 3</option>
        <option value={4}>foo 4</option>
      </select>
    );
  }
}

function Form() {
  const [name, setName] = useState('');

  const handleNameChange = (e) => {
    setName(e.target.value);
    DomLite.findDOMNode(this);
  };

  return (
    <form>
      <Select />
      <input name="name" onInput={handleNameChange} value={name} />
      <button type="button">Click</button>
      <div
        style={{ backgroundColor: 'red', height: '200px', width: '100px' }}
      ></div>
    </form>
  );
}

DomLite.render(<Form />, document.getElementById('app'));
