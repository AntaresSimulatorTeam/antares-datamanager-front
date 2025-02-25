/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { useStudyTableDisplay } from '@/hooks/useStudyTableDisplay';
import { Mock, vi } from 'vitest';
import { useAuth } from 'react-oidc-context';
import { USER_FAKE } from '@/mocks/data/list/user.ts';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('react-oidc-context', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('useStudyTableDisplay', () => {
  const mockUseAuth = useAuth as Mock<typeof useAuth>;

  beforeEach(() => {
    // @ts-expect-error
    mockUseAuth.mockReturnValue({ user: USER_FAKE } as Partial<AuthContextProps>);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches data and updates state correctly', async () => {
    const mockResponse = {
      content: [
        {
          name: 'study1',
          createdBy: 'Luis Perez',
          project: 'Project FE2050',
          status: 'Closed',
          horizon: '2050',
          keywords: 'keyword1',
          creationDate: '2023-01-01',
        },
        {
          name: 'study2',
          createdBy: 'Maria Rojas',
          project: 'Project PDH27',
          status: 'Inactive',
          horizon: '2027',
          keywords: 'keyword2',
          creationDate: '2023-01-01',
        },
      ],
      totalElements: 2,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() =>
      useStudyTableDisplay({ searchTerm: 'test', sortBy: { status: 'desc' }, reloadStudies: false }),
    );
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
      expect(result.current.rows).toEqual(mockResponse.content);
      expect(result.current.count).toEqual(2);
      //expect(global.fetch).toHaveBeenCalledTimes(1); TODO: ANT-2719
      expect(global.fetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/study/search?page=1&size=9&projectId=&search=test&sortColumn=status&sortDirection=desc',
        {},
      );
    });

    await act(async () => {
      renderHook(() => useStudyTableDisplay({ searchTerm: 'mouad', sortBy: { project: 'asc' }, reloadStudies: false }));
    });

    //expect(global.fetch).toHaveBeenCalledTimes(1);  TODO: ANT-2719
    expect(global.fetch).toHaveBeenCalledWith(
      'https://mockapi.com/v1/study/search?page=1&size=9&projectId=&search=mouad&sortColumn=project&sortDirection=asc',
      {},
    );
  });

  it('handles fetch error correctly', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Fetch error'));

    const { result } = renderHook(() =>
      useStudyTableDisplay({ searchTerm: 'test', sortBy: { status: 'desc' }, reloadStudies: true }),
    );

    await waitFor(() => {
      expect(result.current.rows).toEqual([]);
      expect(result.current.count).toEqual(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('updates the page correctly when setPage is called', async () => {
    const mockResponse = {
      content: [
        {
          name: 'study1',
          createdBy: 'Luis Perez',
          project: 'Project FE2050',
          status: 'Closed',
          horizon: '2050',
          keywords: 'keyword1',
          creationDate: '2023-01-01',
        },
      ],
      totalElements: 1,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() =>
      useStudyTableDisplay({
        searchTerm: 'study1',
        projectId: 'projectId',
        sortBy: { status: 'desc' },
        reloadStudies: true,
      }),
    );

    act(() => {
      result.current.setPage(3);
    });

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(1);
      expect(result.current.count).toEqual(1);
      expect(result.current.currentPage).toEqual(3);
    });
  });
});
