/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useMemo, useReducer } from 'react';
import { ProjectContext, ProjectDispatchContext } from './ProjectContext';
import { projectReducer } from '@/store/reducers/projectReducer';
import { ProjectState } from '@/shared/types';
import { selectFilteredProjects } from '@/shared/utils/projectUtils.ts';

export interface ProjectProviderProps {
  children: ReactNode;
  initialValue: ProjectState;
}

export const ProjectProvider = ({ children, initialValue }: ProjectProviderProps) => {
  const [state, dispatch] = useReducer(projectReducer, initialValue);

  const filteredProjects = useMemo(() => selectFilteredProjects(state), [state]);

  const contextValue = useMemo(
    () => ({
      projects: filteredProjects,
      pinnedProjects: state?.pinnedProjects,
    }),
    [filteredProjects, state?.pinnedProjects],
  );

  return (
    <ProjectContext.Provider value={contextValue}>
      <ProjectDispatchContext.Provider value={dispatch}>{children}</ProjectDispatchContext.Provider>
    </ProjectContext.Provider>
  );
};
