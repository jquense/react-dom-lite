import React from 'react';
import * as DomLite from 'react-dom-lite';

class Counter extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { count: 0 };
  }
  handleCount() {
    this.setState(({ count }) => {
      return {
        count: count + 1
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
  handleChange = e => {
    throw new Error();
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

class Form extends React.Component {
  state = {};
  handleNameChange = e => {
    this.setState({ name: e.target.value });
    DomLite.findDOMNode(this);
  };
  render() {
    return (
      <form>
        <Select />
        <input
          name="name"
          onInput={this.handleNameChange}
          value={this.state.name}
        />
        <button type="button" onClick={() => this.forceUpdate()}>
          Click
        </button>
      </form>
    );
  }
}

DomLite.render(<Form />, document.getElementById('app'));
