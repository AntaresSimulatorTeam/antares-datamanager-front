import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useCallback, useEffect, useState } from 'react';
import { getDefaultLoadHypothesis, getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import { CheckBoxData } from '@/components/tab/LoadTab.tsx';
import { TrajectoryAreaData } from '@/shared/types';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';

export const useFetchAreas = (studyId?: number) => {
  const [areaDefault, setAreaDefault] = useState<CheckBoxData[]>([]);
  const [trajectoryAreas, setTrajectoryAreas] = useState<TrajectoryAreaData[]>([]);

  const fetchAreas = useCallback(async (id?: number) => {
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
      }
    } catch {
      // Silent handler
    }
  }, []);

  useEffect(() => {
    void fetchAreas(studyId);
  }, [studyId]);

  return { areaDefault, trajectoryAreas };
};
