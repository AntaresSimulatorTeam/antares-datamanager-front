import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useCallback, useEffect, useState } from 'react';
import { getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import { DbTrajectory, TrajectoryAreaData } from '@/shared/types';
import { getDefaultAreas } from '@/shared/services/defaultConfigService.ts';

export const useFetchAreas = (activeTabId: TRAJECTORY_TYPE, trajectoryArea?: DbTrajectory | null) => {
  const [areaDefault, setAreaDefault] = useState<{ name: string }[]>([]);
  const [trajectoryAreas, setTrajectoryAreas] = useState<TrajectoryAreaData[]>([]);

  const fetchAreas = useCallback(async () => {
    try {
      const defaultAreas: { name: string }[] = await getDefaultAreas();
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
  }, [trajectoryArea?.id]);

  useEffect(() => {
    if (activeTabId !== TRAJECTORY_TYPE.AREA) {
      void fetchAreas();
    }
  }, [trajectoryArea]);

  return { areaDefault, trajectoryAreas };
};
