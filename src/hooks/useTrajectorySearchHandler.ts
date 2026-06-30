import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, SelectOption, StudyDTO } from '@/shared/types';
import { handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';
import { getFetchParams } from '@/shared/utils/trajectoryUtils.ts';
import { SearchParams } from '@/shared/types/HypothesisTable.ts';

interface UseTrajectorySearchHandlerArgs {
  studyData: StudyDTO;
  setDbTrajectories: Dispatch<SetStateAction<DbTrajectory[]>>;
}

export const useTrajectorySearchHandler = ({ studyData, setDbTrajectories }: UseTrajectorySearchHandlerArgs) => {
  const handleSearch = useCallback(
    async (
      tabType: TRAJECTORY_TYPE,
      indexArray: number[],
      options?: SearchParams,
    ): Promise<SelectOption[] | undefined> => {
      const { typeToUse, areaToUse, technology } = getFetchParams(tabType, indexArray, options);

      return await handleTrajectorySearch(typeToUse, setDbTrajectories, studyData.horizon, {
        ...(areaToUse && { area: areaToUse }),
        ...(technology && { technology }),
        ...(options?.fileNameContains && { fileNameContains: options.fileNameContains }),
      });
    },
    [studyData.horizon, setDbTrajectories],
  );

  return { handleSearch };
};
