/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, describe, expectTypeOf, it, Mock, vi } from 'vitest';
import { act, Queries, renderHook, RenderHookOptions } from '@testing-library/react';
import { useStudyNavigation } from '@/hooks/useStudyNavigation.ts';
import { Router, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

const mockNavigator = {
  createHref: vi.fn(),
  go: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
};

const mockStudy = {
  id: 1,
  name: 'BP_ref_1',
  createdBy: 'Isaac Asimov',
  creationDate: new Date('Janvier 18'),
  keywords: ['covid', 'silence'],
  project: 'Bilan previsionnel 2027',
  status: 'missing',
  horizon: '2020_2024',
  trajectoryIds: [2],
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('useStudyNavigation', () => {
  const mockUseNavigation = useNavigate as Mock<typeof useNavigate>;

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return navigateToStudy function and call navigate with the right parameters value', () => {
    const mockNavigate = vi.fn().mockImplementation(vi.fn());
    mockUseNavigation.mockImplementationOnce(() => mockNavigate);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Router location={'/'} navigator={mockNavigator}>
        {children}
      </Router>
    );
    const { result } = renderHook(() => useStudyNavigation(), {
      wrapper,
    } as RenderHookOptions<HTMLElement, Queries>);

    expectTypeOf(result.current.navigateToStudy).toBeFunction();

    act(() => {
      result.current.navigateToStudy(mockStudy);
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/study/${encodeURIComponent(mockStudy.name)}`, {
      state: { study: mockStudy },
    });
  });
});
