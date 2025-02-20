import { createContext, Dispatch, useContext } from 'react';
import { StudyActionType, StudyState } from '@/shared/types';

const initialState: StudyState = {
  isStudyGenerated: false,
  areaTrajectory: null,
  linkTrajectory: null,
};

export const StudyContext = createContext(initialState);
export const StudyDispatchContext = createContext<Dispatch<StudyActionType> | null>(null);

export const useStudy = () => useContext(StudyContext);
export const useStudyDispatch = () => useContext(StudyDispatchContext);
