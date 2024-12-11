/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { vi } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

async function fetchProjectDetails(projectId: string, setProjectDetails: (details: any) => void) {
  // je ne comprends pas cette fonction ni ce fichier de test
  try {
    const response = await fetch(`https://mockapi.com/v1/project/${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project details');
    }
    const data = await response.json();
    setProjectDetails({
      id: data.id,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      creationDate: data.creationDate,
      archived: false,
      pinned: false,
      path: '',
      tags: data.tags,
    });
  } catch (error) {
    console.error(`Error retrieving project details: ${projectId}`, error);
  }
}

describe('fetchProjectDetails', () => {
  const mockSetProjectDetails = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch project details and call setProjectDetails', async () => {
    const projectId = '123';
    const mockResponse = {
      id: '123',
      name: 'Project Name',
      description: 'Project Description',
      createdBy: 'User A',
      creationDate: '2024-01-01',
      tags: ['tag1', 'tag2'],
    };

    //Successful fetch response mock
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await fetchProjectDetails(projectId, mockSetProjectDetails);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`);
    expect(mockSetProjectDetails).toHaveBeenCalledWith({
      id: '123',
      name: 'Project Name',
      description: 'Project Description',
      createdBy: 'User A',
      creationDate: '2024-01-01',
      archived: false,
      pinned: false,
      path: '',
      tags: ['tag1', 'tag2'],
    });
  });

  it('should handle fetch failure gracefully', async () => {
    const projectId = '123';

    // Failed fetch response moc
    mockFetch.mockResolvedValueOnce({
      ok: false,
    });

    await fetchProjectDetails(projectId, mockSetProjectDetails);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`);
    expect(mockSetProjectDetails).not.toHaveBeenCalled();
  });

  it('should handle exceptions during fetch', async () => {
    const projectId = '123';

    //Fetch throwing an error mock
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await fetchProjectDetails(projectId, mockSetProjectDetails);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(`https://mockapi.com/v1/project/${projectId}`);
    expect(mockSetProjectDetails).not.toHaveBeenCalled();
  });
});
