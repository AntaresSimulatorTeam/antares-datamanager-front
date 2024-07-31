/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useInputFormState } from '../useInputFormState';

describe('useInputFormState', () => {
  test('should initialize with the provided value', () => {
    const { result } = renderHook(() => useInputFormState('initialValue', '', undefined));

    expect(result.current.value).toBe('initialValue');
  });

  test('should update the value when onChange is called', () => {
    const { result } = renderHook(() => useInputFormState<string>('initialValue', '', undefined));

    act(() => {
      result.current.setValue('newValue');
    });

    expect(result.current.value).toBe('newValue');
  });

  test('should update the value when updateRef is called', async () => {
    const { result } = renderHook(() => useInputFormState<string>('initialValue', '', undefined, vi.fn()));

    act(() => {
      result.current.setValue('newValue');
    });

    waitFor(() => expect(result.current.value).toBe('newValue'));
  });

  test('should call onChange when the value changes', async () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useInputFormState<string>('initialValue', '', onChange));

    act(() => {
      result.current.setValue('newValue');
    });

    waitFor(() => expect(onChange).toHaveBeenCalledWith('newValue'));
  });
});
