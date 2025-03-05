import { Dispatch, ReactNode, Reducer, useEffect, useReducer } from 'react';
import { DbTrajectory, StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { studyReducer } from '@/store/reducers/studyReducer.tsx';
import { StudyContext, StudyDispatchContext } from '@/store/contexts/StudyContext';
import { useLocation } from 'react-router-dom';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export interface StudyProviderProps {
  children: ReactNode;
  initialValue: Partial<StudyState>;
}

interface LocationState {
  study: StudyDTO;
}

export const StudyProvider = ({ children, initialValue }: StudyProviderProps) => {
  const location = useLocation();
  const study = (location.state as LocationState)?.study;
  const [state, dispatch] = useReducer<Reducer<StudyState, StudyActionType>>(studyReducer, initialValue as StudyState);

  useEffect(() => {
    const getTrajectories = async (d: Dispatch<StudyActionType>) => {
      let response: unknown = [];
      try {
        response = [
          {
            id: 103,
            trajectoryName: 'areas_BP2030_A_ref_v8',
            type: 'AREA',
            version: 1,
            userName: null,
            creationDate: '2025-02-19T15:53:54.453608',
          },
        ]; //await getStudyTrajectories([study.id], TRAJECTORY_TYPE.AREA);
      } finally {
        if (response && (response as DbTrajectory[]).length > 0) {
          d({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: response as DbTrajectory[],
          });
        }
      }
    };
    if (study?.trajectoryIds.length > 0) {
      void getTrajectories(dispatch);
    }
  }, [study]);

  return (
    <StudyContext.Provider value={state}>
      <StudyDispatchContext.Provider value={dispatch}>{children}</StudyDispatchContext.Provider>
    </StudyContext.Provider>
  );
};
