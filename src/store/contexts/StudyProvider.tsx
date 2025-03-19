import { ReactNode, Reducer, useReducer } from 'react';
import { StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { studyReducer } from '@/store/reducers/studyReducer.tsx';
import { StudyContext, StudyDispatchContext } from '@/store/contexts/StudyContext';
import { useLocation } from 'react-router-dom';

export interface StudyProviderProps {
  children: ReactNode;
}

interface LocationState {
  study: StudyDTO;
}

export const StudyProvider = ({ children }: StudyProviderProps) => {
  const location = useLocation();
  const study = (location.state as LocationState)?.study;
  const [state, dispatch] = useReducer<Reducer<StudyState, StudyActionType>>(studyReducer, {
    studyStatus: study?.status,
  });

  return (
    <StudyContext.Provider value={state}>
      <StudyDispatchContext.Provider value={dispatch}>{children}</StudyDispatchContext.Provider>
    </StudyContext.Provider>
  );
};
