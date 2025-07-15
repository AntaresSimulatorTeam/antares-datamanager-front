/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, describe, expectTypeOf, it, Mock, vi } from 'vitest';
import { Queries, renderHook, RenderHookOptions, waitFor } from '@testing-library/react';
import { useStudyNavigation } from '@/hooks/useStudyNavigation.ts';
import { Router, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { mockStudy } from '@/mocks/data/tests/study.mock.ts';
import { notifyToast } from '@/shared/notification/notification.tsx';

const mockNavigator = {
  createHref: vi.fn(),
  go: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
};

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});
vi.mock('@/shared/notification/notification');

describe('useStudyNavigation', () => {
  const mockUseNavigation = useNavigate as Mock<typeof useNavigate>;

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return navigateToStudy function and call navigate with the right parameters value', async () => {
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

    await waitFor(() => {
      void result.current.navigateToStudy(mockStudy);
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/study/${encodeURIComponent(mockStudy.name)}`, {
      state: { study: mockStudy },
    });
  });

  it('should redirect to current page when navigate function throw an error', async () => {
    const mockNavigate = vi.fn().mockRejectedValueOnce({ message: 'Error during navigation' });
    mockUseNavigation.mockImplementationOnce(() => mockNavigate);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Router location={{ pathname: '/', state: mockStudy }} navigator={mockNavigator}>
        {children}
      </Router>
    );
    const { result } = renderHook(() => useStudyNavigation(), {
      wrapper,
    } as RenderHookOptions<HTMLElement, Queries>);

    expectTypeOf(result.current.navigateToStudy).toBeFunction();

    await waitFor(() => {
      void result.current.navigateToStudy(mockStudy);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/', {
      state: mockStudy,
    });
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Error during navigation',
    });
  });
});
