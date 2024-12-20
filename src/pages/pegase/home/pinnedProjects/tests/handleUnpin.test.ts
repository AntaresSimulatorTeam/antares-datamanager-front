/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ProjectInfo } from '@/shared/types/pegase/Project.type';

describe('handleUnpin test', () => {
  it('should update the projects list by removing the unpinned project', () => {
    let updatedProjects: ProjectInfo[] | null = null;

    const mockSetProjects = (callback: (prevProjects: ProjectInfo[]) => ProjectInfo[]) => {
      const prevProjects: ProjectInfo[] = [
        {
          id: '1',
          name: 'Project 1',
          description: 'project1',
          createdBy: 'Luis Rodriguez',
          creationDate: new Date(),
          path: '',
          tags: ['tag1', 'tag2'],
          studies: [],
        },
        {
          id: '2',
          name: 'Project 2',
          description: 'project2',
          createdBy: 'Maria Perez',
          creationDate: new Date(),
          path: '',
          tags: ['tag3', 'tag4'],
          studies: [],
        },
      ];
      updatedProjects = callback(prevProjects);
    };

    const handleUnpin = (
      projectId: string,
      setProjects: (callback: (prevProjects: ProjectInfo[]) => ProjectInfo[]) => void,
    ) => {
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
    };

    handleUnpin('1', mockSetProjects);

    expect(updatedProjects).toEqual([
      {
        id: '2',
        name: 'Project 2',
        description: 'project2',
        createdBy: 'Maria Perez',
        creationDate: expect.any(Date),
        path: '',
        tags: ['tag3', 'tag4'],
        studies: [],
      },
    ]);
  });
});
