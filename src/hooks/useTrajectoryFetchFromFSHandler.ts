import { useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { convertToFSSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import { fetchTrajectoriesFromFS } from '@/shared/services/trajectoryService.ts';
import { FetchTrajectoriesParams } from '@/shared/types';

export const useTrajectoryFetchFromFSHandler = () => {
  const handleFetchFromFS = useCallback(
    async ({
      typeToUse,
      areaToUse,
      isDefaultArea,
      searchTerm,
    }: {
      typeToUse: TRAJECTORY_TYPE;
      areaToUse?: string;
      isDefaultArea?: boolean;
      searchTerm?: string;
    }) => {
      try {
        const args = {} as FetchTrajectoriesParams;
        if (typeToUse) {
          args.trajectoryType = typeToUse;
        }
        if (areaToUse) {
          args.area = areaToUse;
        }
        if (searchTerm) {
          args.searchTerm = searchTerm;
        }
        const results = await fetchTrajectoriesFromFS(args);
        return convertToFSSelectionOptionType(results, isDefaultArea);
      } catch (error) {
        console.error('Error fetching trajectories from FS:', error);
      }
    },
    [],
  );
  return { handleFetchFromFS };
};
