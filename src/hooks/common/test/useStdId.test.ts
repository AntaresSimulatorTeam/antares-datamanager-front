/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook } from '@testing-library/react';
import { useStdId } from '../useStdId';

test('useStdId should return a unique ID with the given prefix', () => {
  const { result } = renderHook(() => useStdId('prefix'));
  const id = result.current;

  expect(id).toMatch(/^prefix-.*$/);
});

test('useStdId should return the provided ID if it is valid', () => {
  const { result } = renderHook(() => useStdId('prefix', 'custom-id'));
  const id = result.current;

  expect(id).toBe('custom-id');
});

test('useStdId should return a unique ID if the provided ID is invalid', () => {
  const { result } = renderHook(() => useStdId('prefix', ''));
  const id = result.current;

  expect(id).toMatch(/^prefix-.*$/);
});
