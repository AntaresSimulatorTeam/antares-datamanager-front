/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useFetchProjectList } from '@/hooks/useFetchProjectList.ts';
import * as projectService from '@/shared/services/projectService.ts';
import { vi } from 'vitest';
import { mockProjectCreation } from '@/mocks/data/tests/project.mock.ts';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/projectService');

describe('useFetchProjectList', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () =>
        Promise.resolve({
          content: mockProjectCreation,
          totalElements: 1,
        }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches projects on mount', async () => {
    vi.mocked(projectService.fetchProjectFromSearchTerm).mockResolvedValueOnce({
      content: [mockProjectCreation],
      totalPages: 1,
    });
    const { result } = renderHook(() => useFetchProjectList(0, 9, 'mouad'));

    await waitFor(() => {
      expect(projectService.fetchProjectFromSearchTerm).toHaveBeenCalledTimes(1);
      expect(projectService.fetchProjectFromSearchTerm).toHaveBeenCalledWith(0, 9, 'mouad');
      expect(result.current.projects).toEqual([mockProjectCreation]);
      expect(result.current.count).toBe(1);
    });
  });

  it('fetches projects with search term', async () => {
    renderHook(() => useFetchProjectList(0, 9, 'test'));

    await waitFor(() => {
      expect(projectService.fetchProjectFromSearchTerm).toHaveBeenCalledTimes(1);
      expect(projectService.fetchProjectFromSearchTerm).toHaveBeenCalledWith(0, 9, 'test');
    });
  });

  it('fetches projects with pagination', async () => {
    renderHook(() => useFetchProjectList(1, 9, ''));

    await waitFor(() => {
      expect(projectService.fetchProjectFromSearchTerm).toHaveBeenCalledWith(1, 9, '');
    });
  });
});
