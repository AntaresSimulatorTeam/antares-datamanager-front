/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook, act } from '@testing-library/react';
import useTimeout from '../useTimeout';

vi.useFakeTimers();

describe('useTimeout', () => {
  test('should call the callback after the specified delay', () => {
    const callback = vi.fn();
    renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalled();
  });

  test('should reset the timer when reset function is called', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(500);
      result.current[0]();
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalled();
  });

  test('should clear the timer when clear function is called', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(500);
      result.current[1]();
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
