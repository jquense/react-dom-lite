import React from 'react'
import * as DomLite from 'react-dom-lite'

class Counter extends React.Component {
  constructor(...args) {
    super(...args)

    this.state = { count: 0 }
  }
  handleCount() {
    this.setState(({ count }) => {
      return {
        count: count + 1,
      }
    })
  }

  render() {
    return (
      <div>
        <span style={{ color: 'red' }} draggable={true}>
          count:
        </span>
        <strong className="foo">{` ${this.state.count}`}</strong>
        <br />
        <button onClick={() => this.handleCount()}>Click</button>

        <Form />
      </div>
    )
  }
}

class Form extends React.Component {
  state = {}
  handleNameChange = e => {
    this.setState({ name: e.target.value })
  }
  render() {
    return (
      <form>
        <input
          name="name"
          onInput={this.handleNameChange}
          value={this.state.name}
        />
        <button onClick={() => this.forceUpdate()}>Click</button>
      </form>
    )
  }
}
DomLite.render(<Counter />, document.getElementById('app'))
