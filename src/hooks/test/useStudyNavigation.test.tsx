/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, it, vi } from 'vitest';
import { Queries, renderHook, RenderHookOptions } from '@testing-library/react';
import { useStudyNavigation } from '@/hooks/useStudyNavigation.ts';
import { renderInRoute } from '@/shared/types/common/tests/testUtils.tsx';
import { RdsButton } from 'rte-design-system-react';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  const mockDispatch = vi.fn();
  return {
    ...actual,
    usePinnedProjectDispatch: vi.fn(() => mockDispatch),
  };
});

describe.skip('useStudyNavigation', () => {
  it('should return settingOption, deleteOption and pinOption functions', () => {
    const wrapper = () => renderInRoute(<RdsButton label="Open" variant="outlined" />, { route: '/', location: '/' });
    const { result } = renderHook(() => useStudyNavigation(), {
      wrapper,
    } as RenderHookOptions<HTMLElement, Queries>);

    expect(result.current.navigateToStudy).toBeFunction();
  });
});
