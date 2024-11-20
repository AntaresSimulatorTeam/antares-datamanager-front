/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { vi } from 'vitest';
import useFetchProjects from '@/pages/pegase/projects/ProjectSearch';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('useFetchProjects', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            content: [
              {
                projectId: '1',
                name: 'Project 1',
                tags: ['Tag1', 'Tag2'],
                creationDate: '2023-10-01',
                createdBy: 'User A',
              },
            ],
            totalElements: 1,
          }),
      }),
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches projects on mount', async () => {
    const { result } = renderHook(() => useFetchProjects('', 0, 9));

    await waitFor(() => {
      expect(result.current.projects).toEqual([
        {
          projectId: '1',
          name: 'Project 1',
          tags: ['Tag1', 'Tag2'],
          creationDate: '2023-10-01',
          createdBy: 'User A',
        },
      ]);
      expect(result.current.count).toBe(1);
    });
  });

  it('fetches projects with search term', async () => {
    renderHook(() => useFetchProjects('test', 0, 9));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/search?page=1&size=9&search=test');
    });
  });

  it('fetches projects with pagination', async () => {
    renderHook(() => useFetchProjects('', 1, 9));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/search?page=2&size=9&search=');
    });
  });
});
