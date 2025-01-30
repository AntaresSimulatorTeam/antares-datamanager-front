/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
  createProject,
  deleteProjectById,
  fetchProjectDetails,
  fetchProjectsFromPartialName,
} from '@/shared/services/projectService';
import { vi } from 'vitest';
import { waitFor } from '@testing-library/react';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

describe('deleteProjectById', () => {
  const projectId = '123';

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    vi.stubGlobal('JSON', {
      parse: (text: string) => {
        return { message: text };
      },
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should delete a pinned project from pinned project list', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
    });

    await deleteProjectById(projectId);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  it('should handle delete failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: () => 'Failed to delete project',
    });

    await expect(async () => deleteProjectById(projectId)).rejects.toThrowError('Failed to delete project');
  });
});

describe('fetchProjectDetails', () => {
  const projectId = '123';
  const mockResponse = {
    id: '123',
    name: 'Project Name',
    description: 'Project Description',
    createdBy: 'User A',
    creationDate: '2024-01-01',
    tags: ['tag1', 'tag2'],
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch project details', async () => {
    //Successful fetch response mock
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResponse),
    });

    await fetchProjectDetails(projectId);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`);
    });
  });

  it('should handle fetch failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
    });

    await expect(async () => fetchProjectDetails(projectId)).rejects.toThrowError('Failed to fetch project details');
  });

  it('should handle exceptions during fetch', async () => {
    //Fetch throwing an error mock
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(async () => fetchProjectDetails(projectId)).rejects.toThrowError('Network error');
  });
});

describe('fetchProjectsFromPartialName', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    vi.stubGlobal('JSON', {
      parse: (text: string) => {
        return { message: text };
      },
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should delete a pinned project from pinned project list', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => {
        return Promise.resolve([
          {
            id: '123',
            name: 'Bilan prévisionnel 2023',
            description: 'Project Description',
            createdBy: 'User A',
            creationDate: '2024-01-01',
            tags: ['tag1', 'tag2'],
          },
          {
            id: '123',
            name: 'Bilan prévisionnel 2019',
            description: 'Project Description',
            createdBy: 'User B',
            creationDate: '2013-08-01',
            tags: ['tag3', 'tag4'],
          },
        ]);
      },
    });

    const result = await fetchProjectsFromPartialName('name');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/autocomplete?partialName=name');
      expect(result).toEqual(['Bilan prévisionnel 2023', 'Bilan prévisionnel 2019']);
    });
  });

  it('should handle delete failure gracefully', async () => {
    // Failed fetch response moc
    vi.stubGlobal('JSON', { parse: (text: string) => text });
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: () => 'Error',
    });

    await expect(async () => fetchProjectsFromPartialName('name')).rejects.toThrowError('Failed to fetch projects');
  });
});

describe('createProject', () => {
  const projectData = { name: 'Bilan prévisionnel 2050', description: '', tags: ['tag1'] };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    vi.stubGlobal('JSON', {
      parse: (text: string) => {
        return { message: text };
      },
      stringify: (text: string) => text,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create de project', async () => {
    const mockProjectResponse = {
      id: 107,
      name: 'Bilan prévisionnel 2050',
      createdBy: 'pegase',
      creationDate: '2025-01-30T10:32:10.631003175',
      studies: [],
      tags: [],
      description: '',
    };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProjectResponse),
    });

    await createProject(projectData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
  });

  it('should handle delete failure gracefully', async () => {
    // Failed fetch response moc
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: () => 'Failed to create project',
    });

    await expect(async () => createProject(projectData)).rejects.toThrowError('Failed to create project');
  });
});
