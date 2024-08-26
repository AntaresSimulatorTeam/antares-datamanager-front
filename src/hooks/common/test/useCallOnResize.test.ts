/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook } from '@testing-library/react';
import { useCallOnResize } from '../useCallOnResize';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('useCallOnResize', () => {
  it('callback should be called when scren size change', async () => {
    const mock = vi.fn();
    renderHook(() => useCallOnResize(mock));
    global.dispatchEvent(new Event('resize'));
    await vi.waitFor(() => expect(mock).toBeCalled());
  });
});
