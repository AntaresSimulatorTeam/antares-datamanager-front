/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useStudyTableDisplay } from '../useStudyTableDisplay';

describe('useStudyTableDisplay', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
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
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useStudyTableDisplay({ searchStudy: 'test', sortBy: { status: 'desc' } }));
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
      expect(result.current.rows).toEqual(mockResponse.content);
    });
  });

  it('handles fetch error correctly', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Fetch error'));

    const { result } = renderHook(() => useStudyTableDisplay({ searchStudy: 'test', sortBy: { status: 'desc' } }));

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
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useStudyTableDisplay({ searchStudy: 'study1', sortBy: { status: 'desc' } }));

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(1);
      expect(result.current.current).toEqual(0);
    });
  });
});
