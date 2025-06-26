import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudy, useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getDefaultLoadHypothesis, getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import { CheckBoxData } from '@/components/tab/LoadTab.tsx';
import { DbTrajectory, TrajectoryAreaData } from '@/shared/types';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { removeDuplicate } from '@/shared/utils/trajectoryUtils.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

export const useFetchAreas = (studyId?: number, trajectoryType?: TRAJECTORY_TYPE) => {
  const [areaDefault, setAreaDefault] = useState<CheckBoxData[]>([]);
  const [trajectoryAreas, setTrajectoryAreas] = useState<TrajectoryAreaData[]>([]);
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
        const defaultAreas: CheckBoxData[] = (await getDefaultLoadHypothesis())?.map((area) => ({
          name: area.name,
          isDefault: true,
        }));
        setAreaDefault(defaultAreas);
        if (id) {
          const trajectoryAreaId = (await getStudyTrajectories(id, TRAJECTORY_TYPE.AREA))?.[0].id;
          if (trajectoryAreaId != null) {
            const areas = (await getTrajectoryDataByTypeAndId(
              TRAJECTORY_TYPE.AREA,
              trajectoryAreaId,
            )) as unknown as TrajectoryAreaData[];
            setTrajectoryAreas(areas);
          }
          if (type) {
            const trajectoryLinkedToStudy = await getStudyTrajectories(id, type);
            dispatch?.({
              type: type === TRAJECTORY_TYPE.LOAD ? STUDY_ACTION.ADD_TRAJECTORIES_LOAD : STUDY_ACTION.ADD_TRAJECTORIES,
              payload: trajectoryLinkedToStudy,
            });
            setTrajectoryLinked(trajectoryLinkedToStudy);
            setEmptyAreas(removeDuplicate(trajectoryLinked.concat(emptyAreaSelected)));
          }
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

  return { areaDefault, trajectoryAreas, trajectoryLinked, emptyAreas };
};
