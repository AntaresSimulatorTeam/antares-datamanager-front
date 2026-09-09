import { useCallback, useEffect, useState } from 'react';
import { getDefaultAreas } from '@/shared/services/defaultConfigService.ts';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { areAllFlowbasedAreasPresent } from '@/shared/utils/trajectoryUtils.ts';
import { DbTrajectory, TrajectoryAreaData } from '@/shared/types';

export const useFetchAreas = (tableType?: TRAJECTORY_TYPE, trajectoryArea?: DbTrajectory) => {
  const dispatch = useStudyDispatch();
  const [areasDefault, setAreasDefault] = useState<{ name: string }[]>([]);
  const [trajectoryAreas, setTrajectoryAreas] = useState<TrajectoryAreaData[]>([]);

  const fetchTrajectoryAreas = useCallback(async () => {
    try {
      const defaultAreas: { name: string }[] = await getDefaultAreas();
      setAreasDefault(defaultAreas);
      let areas: TrajectoryAreaData[] = [];
      if (trajectoryArea?.id != null) {
        areas = await getTrajectoryDataByTypeAndId(
          TRAJECTORY_TYPE.AREA,
          trajectoryArea.id,
        );
        setTrajectoryAreas(areas);
      }
      dispatch?.({ type: STUDY_ACTION.SET_STUDY_AREAS, payload: {areas, defaultAreas} });
    } catch {
      // Silent handler
    }
  }, [dispatch, trajectoryArea?.id]);

  useEffect(() => {
    void fetchTrajectoryAreas();
  }, [tableType, trajectoryArea]);

  const isFlowbasedAllowed = useCallback(async (trajectoryId: number) => {
    try {
      const areas = await getTrajectoryDataByTypeAndId(
        TRAJECTORY_TYPE.AREA,
        trajectoryId,
      );
      const defaultAreas: { name: string }[] = await getDefaultAreas();

      dispatch?.({ type: STUDY_ACTION.SET_STUDY_AREAS, payload: {areas, defaultAreas} });

      const areasName = areas?.map((a) => a.areaName) ?? [];
      return areasName?.length > 0 ? areAllFlowbasedAreasPresent(areasName) : false;
    } catch {
      // Silent handler
    }
  }, [dispatch]);

  return { isFlowbasedAllowed, trajectoryAreas, areasDefault };
};
