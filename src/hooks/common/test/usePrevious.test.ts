/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, Queries, renderHook, RenderHookOptions, waitFor } from '@testing-library/react';
import usePrevious from '../usePrevious';

describe('usePrevious', () => {
  const mockHTMLElement = document.createElement('div');

  it('should return undefined as previous value when no value is provided', () => {
    const { result } = renderHook(() => usePrevious(undefined, undefined));
    expect(result.current).toBeUndefined();
  });

  it('should return initial value as previous value when no previous value exists', () => {
    const { result } = renderHook(() => usePrevious('initial', 'initial'));
    expect(result.current).toBe('initial');
  });

  it('should return previous value when a new value is provided', async () => {
    const { result, rerender } = renderHook((value) => usePrevious(value, mockHTMLElement), {
      initialProps: mockHTMLElement,
    } as RenderHookOptions<HTMLElement, Queries>);

    act(() => {
      rerender(document.createElement('div'));
    });

    expect(result.current).toBe(mockHTMLElement);

    await waitFor(() => expect(result.current).not.toBe(document.createElement('div')));
  });

  it('should return updated previous value when a new value is provided', async () => {
    const { result, rerender } = renderHook((value) => usePrevious(value, mockHTMLElement), {
      initialProps: mockHTMLElement,
    } as RenderHookOptions<HTMLElement, Queries>);

    const mockHTMLElementUpdate = document.createElement('div');

    act(() => {
      rerender(mockHTMLElementUpdate);
    });

    const mockHTMLElementUpdate2 = document.createElement('div');

    act(() => {
      rerender(mockHTMLElementUpdate2);
    });
    await waitFor(() => expect(result.current).toBe(mockHTMLElementUpdate));
  });
});
