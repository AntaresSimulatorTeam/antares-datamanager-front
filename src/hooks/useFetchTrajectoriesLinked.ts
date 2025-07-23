import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DbTrajectory } from '@/shared/types';
import { getStudyTrajectoriesWithWarnings } from '@/shared/services/studyService.ts';
import { removeDuplicate } from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const useFetchTrajectoriesLinked = (studyId?: number, trajectoryType?: TRAJECTORY_TYPE) => {
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
        if (id != null && type) {
          const trajectoryLinkedToStudy = await getStudyTrajectoriesWithWarnings(id, type);
          const arrayWithoutDuplicate = removeDuplicate(trajectoryLinkedToStudy.concat(emptyAreaSelected));
          if (arrayWithoutDuplicate.length > 0) {
            dispatch?.({
              type: STUDY_ACTION.ADD_TRAJECTORIES,
              payload: arrayWithoutDuplicate,
            });
            setEmptyAreas(arrayWithoutDuplicate);
          }
          setTrajectoryLinked(trajectoryLinkedToStudy);
        }
      } catch {
        // Silent handler
      }
    },
    [dispatch, emptyAreaSelected],
  );

  useEffect(() => {
    void fetchAreas(studyId, trajectoryType);
  }, [studyId, trajectoryType]);

  return { trajectoryLinked, emptyAreas };
};
