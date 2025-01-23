/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, describe, expectTypeOf, it, Mock, vi } from 'vitest';
import { act, Queries, renderHook, RenderHookOptions } from '@testing-library/react';
import { Router, useNavigate } from 'react-router-dom';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';

const mockNavigator = {
  createHref: vi.fn(),
  go: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('useProjectNavigation', () => {
  const mockUseNavigation = useNavigate as Mock<typeof useNavigate>;

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return navigateToProject function and call navigate with the right parameters value', () => {
    const mockNavigate = vi.fn().mockImplementation((to) => to);
    mockUseNavigation.mockImplementationOnce(() => mockNavigate);

    const wrapper = ({ children }) => (
      <Router pathname={'/'} history={['/']} location={'/'} navigator={mockNavigator}>
        {children}
      </Router>
    );
    const { result } = renderHook(() => useProjectNavigation(), {
      wrapper,
    } as RenderHookOptions<HTMLElement, Queries>);

    expectTypeOf(result.current.navigateToProject).toBeFunction();

    act(() => {
      result.current.navigateToProject('project123', 'projectName');
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/project/${encodeURIComponent('projectName')}`, {
      state: { projectId: 'project123' },
    });
  });
});
