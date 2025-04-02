import { ReactNode, Reducer, useEffect, useReducer } from 'react';
import { StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { studyReducer } from '@/store/reducers/studyReducer.tsx';
import { StudyContext, StudyDispatchContext } from '@/store/contexts/StudyContext';
import { useLocation } from 'react-router-dom';
import { getStudyById } from '@/shared/services/studyService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

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

  useEffect(() => {
    const getStudyInformations = async () => {
      try {
        const studyData = await getStudyById(study.id);
        dispatch?.({
          type: STUDY_ACTION.SET_STUDY_STATUS,
          payload: (studyData as StudyDTO).status,
        });
      } catch (error) {
        //Silent handler
      }
    };
    void getStudyInformations();
  }, []);

  return (
    <StudyContext.Provider value={state}>
      <StudyDispatchContext.Provider value={dispatch}>{children}</StudyDispatchContext.Provider>
    </StudyContext.Provider>
  );
};
