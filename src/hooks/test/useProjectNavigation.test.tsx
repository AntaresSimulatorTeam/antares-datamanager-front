/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterEach, beforeEach, describe, expectTypeOf, it, Mock, vi } from 'vitest';
import { Queries, renderHook, RenderHookOptions, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useProjectNavigation } from '@/hooks/useProjectNavigation';
import { ReactNode } from 'react';
import { notifyToast } from '@/shared/notification/notification.tsx';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});
vi.mock('@/shared/notification/notification');

describe('useProjectNavigation', () => {
  const mockUseNavigation = useNavigate as Mock<typeof useNavigate>;

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return navigateToProject function and call navigate with the right parameters value', async () => {
    const mockNavigate = vi.fn().mockImplementation(() => {});
    mockUseNavigation.mockImplementationOnce(() => mockNavigate);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useProjectNavigation(), {
      wrapper,
    } as RenderHookOptions<HTMLElement, Queries>);

    expectTypeOf(result.current.navigateToProject).toBeFunction();

    await waitFor(() => {
      void result.current.navigateToProject(123);
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/project/${encodeURIComponent(123)}`, {
      state: { projectId: 123 },
    });
  });

  it('should redirect to current page when navigate function throw an error', async () => {
    const mockNavigate = vi.fn().mockRejectedValueOnce({ message: 'Error during navigation' });
    mockUseNavigation.mockImplementationOnce(() => mockNavigate);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={[{ pathname: '/', state: { studyId: '123' } }]}>{children}</MemoryRouter>
    );
    const { result } = renderHook(() => useProjectNavigation(), {
      wrapper,
    } as RenderHookOptions<HTMLElement, Queries>);

    expectTypeOf(result.current.navigateToProject).toBeFunction();

    await waitFor(() => {
      void result.current.navigateToProject(123);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/', {
      state: { studyId: '123' },
    });
    expect(notifyToast).toHaveBeenCalledWith({
      type: 'error',
      message: 'Error during navigation',
    });
  });
});
