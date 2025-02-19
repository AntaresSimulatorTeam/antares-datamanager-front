import { ReactNode, useReducer } from 'react';
import { StudyState } from '@/shared/types';
import { studyReducer } from '@/store/reducers/studyReducer.tsx';
import { StudyContext, StudyDispatchContext } from '@/store/contexts/StudyContext';

export interface StudyProviderProps {
  children: ReactNode;
  initialValue: StudyState;
}

export const StudyProvider = ({ children, initialValue }: StudyProviderProps) => {
  const initializer = (value = initialValue) => value;

  const [state, dispatch] = useReducer(studyReducer, initialValue, initializer);

  return (
    <StudyContext.Provider value={state}>
      <StudyDispatchContext.Provider value={dispatch}>{children}</StudyDispatchContext.Provider>
    </StudyContext.Provider>
  );
};
