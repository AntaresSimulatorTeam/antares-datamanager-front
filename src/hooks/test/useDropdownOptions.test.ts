/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook } from '@testing-library/react';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { describe, it, expectTypeOf } from 'vitest';

describe('useDropdownOptions', () => {
  it('should return settingOption', () => {
    const { result } = renderHook(() => useDropdownOptions());

    expectTypeOf(result.current.settingOption).toBeFunction();
    expectTypeOf(result.current.deleteOption).toBeFunction();
    expectTypeOf(result.current.pinOption).toBeFunction();
  });
});
