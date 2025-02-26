import { Dispatch, ReactNode, useEffect, useReducer } from 'react';
import { DbTrajectory, StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { studyReducer } from '@/store/reducers/studyReducer.tsx';
import { StudyContext, StudyDispatchContext } from '@/store/contexts/StudyContext';
import { useLocation } from 'react-router-dom';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { getStudyTrajectories } from '@/shared/services/trajectoryService.ts';

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
  const initializer = (value = initialValue as StudyState) => value;
  const [state, dispatch] = useReducer(studyReducer, initialValue as StudyState, initializer);

  useEffect(() => {
    const getTrajectories = async (d: Dispatch<StudyActionType>) => {
      try {
        const response = await getStudyTrajectories([study.id], TRAJECTORY_TYPE.AREA);
        if (response && (response as DbTrajectory[]).length > 0) {
          d({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: response as DbTrajectory[],
          });
        }
      } catch (error) {
        // silent handler;
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
