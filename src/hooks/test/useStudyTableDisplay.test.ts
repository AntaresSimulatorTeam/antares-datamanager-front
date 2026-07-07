/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { useStudyTableDisplay } from '@/hooks/useStudyTableDisplay';
import { vi } from 'vitest';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { mockStudyResponse, mockStudyResponse2 } from '@/mocks/data/tests/study.mock.ts';
import { ProjectInfo } from '@/shared/types';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('useStudyTableDisplay', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches data and updates state correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve(mockStudyResponse2),
    });

    const { result } = renderHook(() =>
      useStudyTableDisplay({
        searchTerm: 'test',
        sortBy: { status: 'desc' },
        reloadStudies: 1,
      }),
    );
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
      expect(result.current.rows).toEqual(mockStudyResponse2.content);
      expect(result.current.count).toEqual(2);
      //expect(global.fetch).toHaveBeenCalledTimes(1); ANT-2719
      expect(global.fetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/study/search?page=1&size=12&search=test&sortColumn=status&sortDirection=desc',
        {},
      );
    });

    act(() => {
      renderHook(() => useStudyTableDisplay({ searchTerm: 'mouad', sortBy: { project: 'asc' }, reloadStudies: 1 }));
    });

    //expect(global.fetch).toHaveBeenCalledTimes(1);  ANT-2719
    expect(global.fetch).toHaveBeenCalledWith(
      'https://mockapi.com/v1/study/search?page=1&size=12&search=mouad&sortColumn=project&sortDirection=asc',
      {},
    );
  });

  it('handles fetch error correctly', async () => {
    global.fetch = vi.fn().mockRejectedValue({
      ok: false,
      json: async () =>
        Promise.resolve({
          antaresErrorMessage: 'Error message',
          date: new Date(),
          type: ERROR_MESSAGE_TYPE.BUSINESS,
        }),
    });

    const { result } = renderHook(() =>
      useStudyTableDisplay({ searchTerm: 'test', sortBy: { status: 'desc' }, reloadStudies: 2 }),
    );

    await waitFor(() => {
      expect(result.current.rows).toEqual([]);
      expect(result.current.count).toEqual(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('updates the page correctly when setPage is called', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => Promise.resolve(mockStudyResponse),
    });

    const { result } = renderHook(() =>
      useStudyTableDisplay({
        searchTerm: 'study1',
        projectInfo: { id: 134 } as ProjectInfo,
        sortBy: { status: 'desc' },
        reloadStudies: 3,
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
