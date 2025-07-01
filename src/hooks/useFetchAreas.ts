import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useCallback, useEffect, useState } from 'react';
import { getDefaultLoadHypothesis, getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import { CheckBoxData, DbTrajectory, TrajectoryAreaData } from '@/shared/types';

export const useFetchAreas = (trajectoryArea?: DbTrajectory | null) => {
  const [areaDefault, setAreaDefault] = useState<CheckBoxData[]>([]);
  const [trajectoryAreas, setTrajectoryAreas] = useState<TrajectoryAreaData[]>([]);

  const fetchAreas = useCallback(async () => {
    try {
      const defaultAreas: CheckBoxData[] = (await getDefaultLoadHypothesis())?.map((area) => ({
        name: area.name,
        isDefault: true,
      }));
      setAreaDefault(defaultAreas);
      if (trajectoryArea?.id != null) {
        const areas = (await getTrajectoryDataByTypeAndId(
          TRAJECTORY_TYPE.AREA,
          trajectoryArea?.id,
        )) as unknown as TrajectoryAreaData[];
        setTrajectoryAreas(areas);
      }
    } catch {
      // Silent handler
    }
  }, [trajectoryArea]);

  useEffect(() => {
    void fetchAreas();
  }, [trajectoryArea]);

  return { areaDefault, trajectoryAreas };
};
