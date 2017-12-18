import React from 'react';
import { render } from 'react-dom-lite';

describe('DOMProperties', () => {
  describe('setValueOnElement', () => {
    it('should set values as properties by default', () => {
      const container = document.createElement('div');
      render(<div title="Tip!" />, container);
      expect(container.firstChild.title).toBe('Tip!');
    });

    it('should set values as attributes if necessary', () => {
      const container = document.createElement('div');
      render(<div role="#" />, container);
      expect(container.firstChild.getAttribute('role')).toBe('#');
      expect(container.firstChild.role).toBeUndefined();
    });

    it('should set values as attributes for specific props', () => {
      const container = document.createElement('div');
      render(<input type="button" readOnly />, container);
      expect(container.firstChild.getAttribute('type')).toBe('button');
      expect(container.firstChild.readOnly).toBe(true);
    });

    it('should set boolean string attributes', () => {
      const container = document.createElement('div');
      render(<div spellCheck />, container);
      expect(container.firstChild.getAttribute('spellcheck')).toBe('true');
      render(<div spellCheck={false} />, container);
      expect(container.firstChild.getAttribute('spellcheck')).toBe('false');
    });
  });
});
