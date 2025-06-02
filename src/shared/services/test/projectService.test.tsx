/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  createProject,
  deleteProjectById,
  fetchProjectDetails,
  fetchProjectFromSearchTerm,
  fetchProjectsFromPartialName,
} from '@/shared/services/projectService';
import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import {
  mockProjectCreation,
  mockProjectInfo,
  mockProjectInfoArray,
  projectData,
} from '@/shared/services/test/mocks/projectMock.tsx';
import { AuthService } from '@/shared/services/authService.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));
vi.mock('@/shared/services/authService');

const projectId = '123';

describe('deleteProjectById', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.stubGlobal('JSON', {
      parse: (text: string) => ({ message: text }),
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should delete a pinned project from pinned project list', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    await deleteProjectById(projectId);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`, {
        method: 'DELETE',
      });
    });
  });

  it('should handle delete failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to delete project',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => deleteProjectById(projectId)).rejects.toThrowError('Failed to delete project');
  });
});

describe('fetchProjectDetails', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch project details', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockProjectInfo),
    } as Response);

    const result = await fetchProjectDetails(projectId);

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`);
      expect(result).toEqual(mockProjectInfo);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch project details',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => fetchProjectDetails(projectId)).rejects.toThrowError('Failed to fetch project details');
  });
});

describe('fetchProjectsFromPartialName', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.stubGlobal('JSON', {
      parse: (text: string) => ({ message: text }),
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('should search projects by partial name', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockProjectInfoArray),
    } as Response);

    const result = await fetchProjectsFromPartialName('name');

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/project/autocomplete?partialName=name',
      );
      expect(result).toEqual(['Bilan prévisionnel 2023', 'Bilan prévisionnel 2019']);
    });
  });

  it('should handle fetch projects failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to fetch projects',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => fetchProjectsFromPartialName('name')).rejects.toThrowError('Failed to fetch projects');
  });
});

describe('fetchProjectFromSearchTerm', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.stubGlobal('JSON', {
      parse: (text: string) => ({ message: text }),
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('should search projects by search term', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockProjectInfoArray),
    } as Response);

    const result = await fetchProjectFromSearchTerm(3, 10, 'searchTerm');

    await waitFor(() => {
      expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
      expect(AuthService.authFetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/project/search?search=searchTerm&page=4&size=10',
      );
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockProjectInfoArray);
    });
  });

  it('should handle search by term failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to search projects',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => fetchProjectFromSearchTerm(3, 10, 'searchTerm')).rejects.toThrowError(
      'Failed to search projects',
    );
  });
});

describe('createProject', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.stubGlobal('JSON', {
      parse: (text: string) => ({ message: text }),
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create de project', async () => {
    vi.mocked(AuthService.authFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockProjectCreation),
    } as Response);

    const result = await createProject(projectData);

    expect(AuthService.authFetch).toHaveBeenCalledTimes(1);
    expect(AuthService.authFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    expect(result).toEqual(mockProjectCreation);
  });

  it('should handle delete failure gracefully', async () => {
    vi.mocked(AuthService.authFetch).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to create project',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => createProject(projectData)).rejects.toThrowError('Failed to create project');
  });
});
