import { Dispatch, ReactNode, Reducer, useEffect, useReducer } from 'react';
import { DbTrajectory, StudyActionType, StudyDTO, StudyState } from '@/shared/types';
import { studyReducer } from '@/store/reducers/studyReducer.tsx';
import { StudyContext, StudyDispatchContext } from '@/store/contexts/StudyContext';
import { useLocation } from 'react-router-dom';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { getStudyTrajectories } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

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
      const trajectories: DbTrajectory[] = [];
      try {
        const promises = [TRAJECTORY_TYPE.AREA, TRAJECTORY_TYPE.LINK].map(async (type) => {
          const response = (await getStudyTrajectories(study.id, type)) as DbTrajectory[];
          if (response[0] || response[0]) trajectories.push(response[0]);
        });

        await Promise.all(promises);
      } finally {
        if (trajectories && trajectories?.length > 0) {
          d({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: trajectories,
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
