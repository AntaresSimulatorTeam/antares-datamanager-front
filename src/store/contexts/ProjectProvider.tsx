/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, Reducer, useReducer } from 'react';
import { ProjectActionType, ProjectState } from '@/shared/types/Project.type.ts';
import projectReducer from '@/store/reducers/projectReducer';
import { ProjectContext, ProjectDispatchContext } from '@/store/contexts/ProjectContext';

export interface ProjectProviderProps {
  children: ReactNode;
  initialValue: ProjectState;
}

export const ProjectProvider = ({ children, initialValue }: ProjectProviderProps) => {
  const [state, dispatch] = useReducer<Reducer<ProjectState, ProjectActionType>>(projectReducer, initialValue);

  return (
    <ProjectContext.Provider value={state}>
      <ProjectDispatchContext.Provider value={dispatch}>{children}</ProjectDispatchContext.Provider>
    </ProjectContext.Provider>
  );
};
