/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { act, renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

describe('useNewStudyModal', () => {
  it('should return isModalOpen and toggleModal function', () => {
    const { result } = renderHook(() => useNewStudyModal());

    expect(result.current.isModalOpen).toBe(false);
    expectTypeOf(result.current.toggleModal).toBeFunction();

    act(() => {
      result.current.toggleModal();
    });

    expect(result.current.isModalOpen).toBe(true);
  });
});
