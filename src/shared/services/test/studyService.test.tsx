/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { fetchSearchStudies } from '@/shared/services/studyService.ts';

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('fetchSearchStudies', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch study list', async () => {
    //Successful fetch response mock
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
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
    });

    const result = await fetchSearchStudies('test', '124', 3, 10, { column: 'asc' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://mockapi.com/v1/study/search?page=4&size=10&projectId=124&search=test&sortColumn=column&sortDirection=asc`,
      );
      expect(result).toEqual({
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
      });
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () => fetchSearchStudies('test', '124', 3, 10, { column: 'asc' })).rejects.toThrowError(
      'Failed to fetch user studies',
    );
  });
});
