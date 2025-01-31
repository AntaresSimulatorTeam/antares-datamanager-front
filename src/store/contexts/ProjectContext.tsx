/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react';
import { ProjectActionType, ProjectState } from '@/shared/types/pegase/Project.type';
import projectReducer from '@/store/reducers/projectReducer';

const initialValue: ProjectState = { projects: [], pinnedProjects: [] };

export const ProjectContext = createContext<ProjectState>(initialValue);
export const ProjectDispatchContext = createContext<Dispatch<ProjectActionType> | null>(null);

export const useProject = () => useContext(ProjectContext);
export const useProjectDispatch = () => useContext(ProjectDispatchContext);

export interface ProjectProviderProps {
  children: ReactNode;
  initialValue: ProjectState;
}

export const ProjectProvider = ({ children, initialValue }: ProjectProviderProps) => {
  const initializer = (value = initialValue) => value;

  const [state, dispatch] = useReducer(projectReducer, initialValue, initializer);

  return (
    <ProjectContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>{children}</ProjectDispatchContext.Provider>
    </ProjectContext.Provider>
  );
};
