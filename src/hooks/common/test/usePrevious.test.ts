/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import usePrevious from '../usePrevious';

describe('usePrevious', () => {
  it('should return undefined as previous value when no value is provided', () => {
    const { result } = renderHook(() => usePrevious(undefined, undefined));
    expect(result.current).toBeUndefined();
  });

  it('should return initial value as previous value when no previous value exists', () => {
    const { result } = renderHook(() => usePrevious('initial', 'initial'));
    expect(result.current).toBe('initial');
  });

  it('should return previous value when a new value is provided', async () => {
    const { result, rerender } = renderHook((value) => usePrevious(value, 'initial'), {
      initialProps: 'initial',
    });

    act(() => {
      rerender('updated');
    });

    expect(result.current).toBe('initial');

    await waitFor(() => expect(result.current).not.toBe('updated'));
  });

  it('should return updated previous value when a new value is provided', async () => {
    const { result, rerender } = renderHook((value) => usePrevious(value, 'initial'), {
      initialProps: 'initial',
    });

    act(() => {
      rerender('updated');
    });

    act(() => {
      rerender('updated 2');
    });
    await waitFor(() => expect(result.current).toBe('updated'));
  });
});
