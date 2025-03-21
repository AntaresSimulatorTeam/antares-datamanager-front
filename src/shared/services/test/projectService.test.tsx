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
import { mockProjectInfo, mockProjectInfoArray } from '@/shared/services/test/mocks/projectMock.tsx';

vi.mock('@/shared/notification/notification');
vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

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
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch project details', async () => {
    //Successful fetch response mock
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockProjectInfo),
    });

    const result = await fetchProjectDetails(projectId);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`, {});
      expect(result).toEqual(mockProjectInfo);
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
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProjectInfoArray),
    });

    const result = await fetchProjectsFromPartialName('name');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/autocomplete?partialName=name', {});
      expect(result).toEqual(['Bilan prévisionnel 2023', 'Bilan prévisionnel 2019']);
    });
  });

  it('should handle fetch projects failure gracefully', async () => {
    // Failed fetch response moc
    //vi.stubGlobal('JSON', { parse: (text: string) => text });
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: async () => Promise.resolve('Failed to fetch projects'),
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
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProjectInfoArray),
    });
    const result = await fetchProjectFromSearchTerm(3, 10, 'searchTerm');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://mockapi.com/v1/project/search?search=searchTerm&page=4&size=10',
        {},
      );
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockProjectInfoArray);
    });
  });

  it('should handle search by term failure gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: async () => Promise.resolve('Failed to search projects'),
    });

    await expect(async () => fetchProjectFromSearchTerm(3, 10, 'searchTerm')).rejects.toThrowError(
      'Failed to search projects',
    );
  });
});

describe('createProject', () => {
  const projectData = { name: 'Bilan prévisionnel 2050', description: '', tags: ['tag1'] };

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
    const creationResponse = {
      id: 107,
      name: projectData.name,
      createdBy: 'pegase',
      creationDate: '2025-01-30T10:32:10.631003175',
      studies: [],
      tags: projectData.tags,
      description: projectData.description,
    };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(creationResponse),
    });

    const result = await createProject(projectData);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    expect(result).toEqual(creationResponse);
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
