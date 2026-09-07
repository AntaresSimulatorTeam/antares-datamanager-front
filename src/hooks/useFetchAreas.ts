import { useCallback } from 'react';
import { getDefaultAreas } from '@/shared/services/defaultConfigService.ts';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { areAllFlowbasedAreasPresent } from '@/shared/utils/trajectoryUtils.ts';

export const useFetchAreas = () => {
  const dispatch = useStudyDispatch();

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

  return { isFlowbasedAllowed };
};
