/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ProjectActionType, ProjectInfo, ProjectState } from '@/shared/types/Project.type.ts';
import { PROJECT_ACTION } from '@/shared/enum/project';

// PROJECTS
export const addProject = (currentState: ProjectState, payload: ProjectInfo) => {
  const { pinnedProjects, projects } = currentState;
  return { projects: [payload, ...projects], pinnedProjects };
};
export const updateProject = (currentState: ProjectState, payload: ProjectInfo) => {
  const { pinnedProjects, projects } = currentState;
  const updateProjects = projects.map((project) => (project.id === payload.id ? payload : project));
  const updatePinnedProjects = pinnedProjects.map((project) =>
    project.id === payload.id ? { ...payload, pinned: true } : project,
  );
  return { projects: updateProjects, pinnedProjects: updatePinnedProjects };
};
export const removeProject = (currentState: ProjectState, payload: number) => {
  const { pinnedProjects, projects } = currentState;
  return {
    projects: [...projects.filter((p) => p.id !== payload)],
    pinnedProjects: [...pinnedProjects.filter((p) => p.id !== payload)],
  };
};
// PINNED PROJECTS
export const addPinnedProject = (currentState: ProjectState, payload: ProjectInfo) => {
  const { pinnedProjects, projects } = currentState;
  payload.pinned = true;
  return { projects, pinnedProjects: [...pinnedProjects, payload] };
};
export const unpinPinnedProject = (currentState: ProjectState, payload: number) => {
  const { pinnedProjects, projects } = currentState;
  return { projects, pinnedProjects: [...pinnedProjects.filter((p) => p.id !== payload)] };
};

export const projectReducer = (prevState: ProjectState, action?: ProjectActionType): ProjectState => {
  if (action) {
    switch (action.type) {
      case PROJECT_ACTION.ADD_PROJECT:
        return addProject(prevState, action.payload);
      case PROJECT_ACTION.UPDATE_PROJECT:
        return updateProject(prevState, action.payload);
      case PROJECT_ACTION.REMOVE_PROJECT:
        return removeProject(prevState, action.payload);
      case PROJECT_ACTION.INIT_PROJECT_LIST:
        return { projects: [...action.payload], pinnedProjects: [...prevState.pinnedProjects] };
      case PROJECT_ACTION.ADD_PINNED_PROJECT:
        return addPinnedProject(prevState, action.payload);
      case PROJECT_ACTION.UNPIN_PINNED_PROJECT:
        return unpinPinnedProject(prevState, action.payload);
      case PROJECT_ACTION.INIT_PINNED_PROJECT_LIST:
        return { projects: [...prevState.projects], pinnedProjects: [...action.payload] };
      default:
        return prevState;
    }
  }

  return prevState;
};
