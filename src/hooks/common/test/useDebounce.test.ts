/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useDebounce from '../useDebounce';

describe('useDebounce', () => {
  test('should call the callback after the delay', () => {
    const callback = vi.fn();
    act(() => {
      renderHook(() => useDebounce(callback, 'dependency', 200));
    });

    expect(callback).not.toBeCalled();
    void waitFor(() => expect(callback).toBeCalled(), { timeout: 300 });
  });

  test('should reset the timer when the dependency changes', async () => {
    const callback = vi.fn();
    let rerender: (props?: string) => void;
    act(() => {
      const { rerender: rerenderHook } = renderHook((dependency: string) => useDebounce(callback, dependency, 200), {
        initialProps: 'initialDependency',
      });
      rerender = rerenderHook;
    });

    await waitFor(() => expect(callback).not.toBeCalled());
    act(() => {
      rerender?.('updatedDependency');
    });
    await waitFor(() => expect(callback).not.toBeCalled());
    await waitFor(() => expect(callback).toBeCalled());
  });
});
