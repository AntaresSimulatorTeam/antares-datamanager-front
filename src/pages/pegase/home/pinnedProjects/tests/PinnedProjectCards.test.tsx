/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

interface ProjectInfo {
  projectId: string;
  name: string;
  pinned?: boolean;
}

const handleUnpin = (projectId: string, setProjects: React.Dispatch<React.SetStateAction<ProjectInfo[]>>) => {
  setProjects((prevProjects) => prevProjects.filter((project) => project.projectId !== projectId));
};

const transformProjects = (json: any[]): ProjectInfo[] => {
  return json.map((project: any) => ({
    ...project,
    projectId: project.id.toString(), // Convert id to string
    pinned: project.pinned ?? true, // Default pinned to true if not provided
  }));
};

describe('PinnedProjectCards Logic', () => {
  it('should remove the project with the given projectId when handleUnpin is called', () => {
    const setProjects = jest.fn(); // Mock the setProjects function

    // Simulate calling handleUnpin with projectId '1'
    handleUnpin('1', setProjects);

    // Ensure setProjects was called with the updated projects list
    expect(setProjects).toHaveBeenCalledWith([{ projectId: '2', name: 'Project 2', pinned: false }]);
  });

  it('should transform the fetched JSON data correctly', () => {
    const json = [
      { id: 1, name: 'Project 1', pinned: true },
      { id: 2, name: 'Project 2' }, // No pinned property, should default to true
    ];

    const transformedProjects = transformProjects(json);

    // Verify that the transformation adds the projectId and defaults pinned to true
    expect(transformedProjects).toEqual([
      { projectId: '1', name: 'Project 1', pinned: true },
      { projectId: '2', name: 'Project 2', pinned: true }, // Pinned is true by default
    ]);
  });

  it('should handle transformation and unpin together', () => {
    const json = [
      { id: 1, name: 'Project 1', pinned: true },
      { id: 2, name: 'Project 2' },
    ];

    // First, transform the JSON data
    const transformedProjects = transformProjects(json);

    const setProjects = jest.fn(); // Mock the setProjects function

    // Simulate calling handleUnpin with projectId '1'
    handleUnpin('1', setProjects);

    // Ensure setProjects was called with the updated list after unpinning 'Project 1'
    expect(setProjects).toHaveBeenCalledWith([{ projectId: '2', name: 'Project 2', pinned: true }]);
  });
});
