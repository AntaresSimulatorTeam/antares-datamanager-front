/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useReducer } from 'react';
import { ProjectState } from '@/shared/types/Project.type.ts';
import projectReducer from '@/store/reducers/projectReducer';
import { ProjectContext, ProjectDispatchContext } from '@/store/contexts/ProjectContext';

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
