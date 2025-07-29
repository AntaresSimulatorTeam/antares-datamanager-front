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
    () => (trajectoryType ? (studyState?.[trajectoryType]?.trajectories ?? []) : []),
    [trajectoryType],
  );

  const fetchAreas = useCallback(
    async (id?: number, type?: TRAJECTORY_TYPE) => {
      try {
        if (id != null && type) {
          const result = await getStudyTrajectoriesWithWarnings(id, type);
          if (result?.trajectories?.length > 0) {
            const arrayWithoutDuplicate = removeDuplicate(result?.trajectories?.concat(emptyAreaSelected));
            dispatch?.({
              type: STUDY_ACTION.ADD_TRAJECTORIES,
              payload: { [type]: { trajectories: arrayWithoutDuplicate, warningMessages: result?.warningMessages } },
            });
            setEmptyAreas(arrayWithoutDuplicate);
          }
          setTrajectoryLinked(result?.trajectories);
        }
      } catch {
        // Silent handler
      }
    },
    [dispatch, emptyAreaSelected, trajectoryLinked],
  );

  useEffect(() => {
    void fetchAreas(studyId, trajectoryType);
  }, [studyId, trajectoryType]);

  return { trajectoryLinked, emptyAreas };
};
