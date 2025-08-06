import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DbTrajectory, TrajectoryState } from '@/shared/types';
import { getStudyTrajectoriesWithWarnings } from '@/shared/services/trajectoryService';
import { buildEmptyTrajectory, removeDuplicate } from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { OTHER_AREAS } from '@/shared/const/studyConfig.ts';

export const useFetchHypothesisTrajectories = (
  studyId?: number,
  trajectoryType?: TRAJECTORY_TYPE,
  defaultAreas?: { name: string }[],
) => {
  //const [trajectoryLinked, setTrajectoryLinked] = useState<DbTrajectory[]>([]);
  const [hypothesisTrajectories, setHypothesisTrajectories] = useState<DbTrajectory[]>([]);
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
          const result: TrajectoryState = await getStudyTrajectoriesWithWarnings(id, type);
          const areaDefault = [
            { name: OTHER_AREAS },
            ...(Array.isArray(defaultAreas) && defaultAreas.length > 0 ? defaultAreas : []),
          ];

          // check if default areas are not already linked to a trajectory
          const defaultAreasNotLinkedToStudy =
            result?.trajectories.length > 0
              ? areaDefault?.filter((area) =>
                  result?.trajectories.find((trajectory) => area.name !== trajectory.loadArea),
                )
              : areaDefault;
          const defaultEmptyAreas = (defaultAreasNotLinkedToStudy || []).map((defaultArea) =>
            buildEmptyTrajectory(defaultArea.name, type),
          );

          const arrayWithoutDuplicate: DbTrajectory[] = removeDuplicate(
            result?.trajectories?.concat(emptyAreaSelected).concat(defaultEmptyAreas),
          );

          dispatch?.({
            type: STUDY_ACTION.ADD_TRAJECTORIES,
            payload: {
              [type]: {
                trajectories: arrayWithoutDuplicate,
                warningMessages: result?.warningMessages,
              },
            },
          });
          setHypothesisTrajectories(arrayWithoutDuplicate);
        }
      } catch {
        // Silent handler
      }
    },
    [defaultAreas, emptyAreaSelected, dispatch],
  );

  useEffect(() => {
    void fetchAreas(studyId, trajectoryType);
  }, [studyId, trajectoryType]);

  return { hypothesisTrajectories };
};
