import { ProjectActionType, ProjectState } from '@/shared/types';
import { createContext, Dispatch, useContext } from 'react';

const initialState: ProjectState = { projects: [], pinnedProjects: [] };

export const ProjectContext = createContext<ProjectState>(initialState);
export const ProjectDispatchContext = createContext<Dispatch<ProjectActionType> | null>(null);

export const useProject = () => useContext(ProjectContext);
export const useProjectDispatch = () => useContext(ProjectDispatchContext);
