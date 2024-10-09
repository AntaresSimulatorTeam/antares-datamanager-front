/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { render } from '@testing-library/react';
import { getDimensions } from '../getDimensions';

const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 8 });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 8 });
});

afterAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight!);
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth!);
});

const TEST_ID = 'test';
describe('GetDimension', () => {
  it('height and width should be return when component is display', () => {
    render(
      <div>
        <span style={{ height: '8px', width: '8px' }} id={TEST_ID}>
          test
        </span>
      </div>,
    );
    const dimension = getDimensions(document.querySelector(`#${TEST_ID}`)!);
    expect(dimension.height).toEqual(8);
    expect(dimension.width).toEqual(8);
  });
  it('height and width should be return when component is not display', () => {
    render(
      <div>
        <span style={{ height: '8px', width: '8px', display: 'none' }} id={TEST_ID}>
          test
        </span>
      </div>,
    );
    const dimension = getDimensions(document.querySelector(`#${TEST_ID}`)!);
    expect(dimension.height).toEqual(8);
    expect(dimension.width).toEqual(8);
  });
});
