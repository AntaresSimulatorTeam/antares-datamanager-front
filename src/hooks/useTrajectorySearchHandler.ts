import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, DropdownItemOption } from '@/shared/types';
import { handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { getFetchFromDbParams } from '@/shared/utils/trajectoryUtils.ts';
import { SearchParams } from '@/shared/types/HypothesisTable.ts';

interface UseTrajectorySearchHandlerArgs {
  studyHorizon: string;
  setDbTrajectories: Dispatch<SetStateAction<DbTrajectory[]>>;
}

export const useTrajectorySearchHandler = ({ studyHorizon, setDbTrajectories }: UseTrajectorySearchHandlerArgs) => {
  const handleSearch = useCallback(
    async (
      tabType: TRAJECTORY_TYPE,
      indexArray: number[],
      options?: SearchParams,
    ): Promise<DropdownItemOption[] | undefined> => {
      const { typeToUse, areaToUse, technology } = getFetchFromDbParams(tabType, indexArray, options);

      return await handleTrajectorySearch(typeToUse, setDbTrajectories, studyHorizon, {
        ...(areaToUse && { area: areaToUse }),
        ...(technology && { technology }),
        ...(options?.fileNameContains && { fileNameContains: options.fileNameContains }),
      });
    },
    [studyHorizon, setDbTrajectories],
  );

  return { handleSearch };
};
