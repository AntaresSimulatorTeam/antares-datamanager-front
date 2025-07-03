import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DbTrajectory } from '@/shared/types';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { removeDuplicate } from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const useFetchTrajectoriesLinked = (studyId?: number, trajectoryType?: TRAJECTORY_TYPE, refreshTrigger?: number) => {
  const [trajectoryLinked, setTrajectoryLinked] = useState<DbTrajectory[]>([]);
  const [emptyAreas, setEmptyAreas] = useState<DbTrajectory[]>([]);
  const studyState = useStudy();
  const dispatch = useStudyDispatch();
  const emptyAreaSelected = useMemo(
    () => (trajectoryType ? (studyState?.[trajectoryType] ?? []) : []),
    [trajectoryType],
  );

  const fetchAreas = useCallback(
    async (id?: number, type?: TRAJECTORY_TYPE) => {
      try {
        if (id && type) {
          const trajectoryLinkedToStudy = await getStudyTrajectories(id, type);
          dispatch?.({
            type: type === TRAJECTORY_TYPE.LOAD ? STUDY_ACTION.ADD_TRAJECTORIES_LOAD : STUDY_ACTION.ADD_TRAJECTORIES,
            payload: trajectoryLinkedToStudy,
          });
          setTrajectoryLinked(trajectoryLinkedToStudy);
          setEmptyAreas(removeDuplicate(trajectoryLinkedToStudy.concat(emptyAreaSelected)));
        }
      } catch {
        // Silent handler
      }
    },
    [dispatch, emptyAreaSelected, trajectoryLinked],
  );

  useEffect(() => {
    void fetchAreas(studyId, trajectoryType);
  }, [studyId, trajectoryType, refreshTrigger]);

  return { trajectoryLinked, emptyAreas };
};
