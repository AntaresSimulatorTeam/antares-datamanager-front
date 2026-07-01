import { useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { convertToFSSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import { fetchTrajectoriesFromFS } from '@/shared/services/trajectoryService.ts';

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
        const args: [TRAJECTORY_TYPE, string?, string?] = [typeToUse];
        if (areaToUse) {
          args.push(areaToUse);
        }
        if (searchTerm) {
          args.push(searchTerm);
        }
        const results = await fetchTrajectoriesFromFS(...args);
        return convertToFSSelectionOptionType(results, isDefaultArea);
      } catch (error) {
        console.error('Error fetching trajectories from FS:', error);
      }
    },
    [],
  );
  return { handleFetchFromFS };
};
