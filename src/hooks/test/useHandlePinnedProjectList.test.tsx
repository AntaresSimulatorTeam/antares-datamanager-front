/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Queries, renderHook, RenderHookOptions, waitFor } from '@testing-library/react';
import { useHandlePinnedProjectList } from '@/hooks/useHandlePinnedProjectList';
import { afterEach, beforeEach, describe, expectTypeOf, it, vi } from 'vitest';
import { PinnedProjectProvider, PinnedProjectProviderProps } from '@/store/contexts/ProjectContext';

const mockProjectsApiResponse = [
  {
    id: '1',
    name: 'Bilan previsionnel 2027',
    createdBy: 'MOUAD Paris test',
    creationDate: '2024-07-25T10:09:41',
    studies: [1, 2, 3],
    tags: ['gaz', 'elec', 'antares', 'misc', 'tag2 antares', 'area link'],
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    projectId: '1',
    pinned: true,
  },
  {
    id: '2',
    name: 'Bilan previsionnel 2023',
    createdBy: 'Taher benjelloun amine',
    creationDate: '2024-07-25T10:09:41',
    studies: [6, 5, 9],
    tags: ['bilan 22'],
    description: 'description2023',
    projectId: '2',
    pinned: true,
  },
  {
    id: '3',
    name: 'Bilan previsionnel 2025',
    createdBy: 'zayd guillaume pegase',
    creationDate: '2024-07-25T10:09:41',
    studies: [7, 8],
    tags: ['figma', 'config', 'modal'],
    description: 'In the world of software development, achieving perfection is a journey rather than a destination.',
    projectId: '3',
    pinned: true,
  },
];

vi.mock('@/envVariables', () => ({
  getEnvVariables: vi.fn(() => 'https://mockapi.com'),
}));

vi.mock('@/store/contexts/ProjectContext', async (importOriginal) => {
  const actual = await importOriginal();
  const mockDispatch = vi.fn();
  return {
    ...actual,
    usePinnedProjectDispatch: vi.fn(() => mockDispatch),
  };
});

describe('useHandlePinnedProjectList', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should trigger getPinnedProject method on init and update pinned project list correctly', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockProjectsApiResponse,
    });

    const wrapper = ({ children, initialValue }) => (
      <PinnedProjectProvider children={children} initialValue={initialValue}></PinnedProjectProvider>
    );

    const { result } = renderHook(() => useHandlePinnedProjectList(), {
      wrapper,
      initialProps: { initialValue: { pinnedProject: [] } },
    } as RenderHookOptions<HTMLElement & { initialProps: Omit<PinnedProjectProviderProps, 'children'> }, Queries>);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('https://mockapi.com/v1/project/pinned?userId=me00247');
      expectTypeOf(result.current.getPinnedProjects).toBeFunction();
      expectTypeOf(result.current.handleUnpinProject).toBeFunction();
      expectTypeOf(result.current.handlePinProject).toBeFunction();
    });
  });
});
