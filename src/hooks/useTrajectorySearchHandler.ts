import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, HypothesisRowData, SelectOption, StudyDTO } from '@/shared/types';
import { handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';

interface UseTrajectorySearchHandlerArgs {
  data: HypothesisRowData[];
  type: TRAJECTORY_TYPE;
  studyData: StudyDTO;
  setDbTrajectories: Dispatch<SetStateAction<DbTrajectory[]>>;
}

export const useTrajectorySearchHandler = ({
  data,
  type,
  studyData,
  setDbTrajectories,
}: UseTrajectorySearchHandlerArgs) => {
  const handleSearch = useCallback(
    async (fileNameContains: string, rowId: string): Promise<SelectOption[] | undefined> => {
      const indexArray = rowId.split('.').map(Number);
      const rowIndex = indexArray[0];
      const subIndex = indexArray[1];

      const isLastIndex = rowIndex === Math.max(data.length - 1, 0);

      let typeToUse: TRAJECTORY_TYPE = type;
      let areaToUse = data[rowIndex]?.hypothesis;
      if (type === TRAJECTORY_TYPE.AREA) {
        typeToUse = indexArray[0] === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
        areaToUse = '';
      }
      if (type === TRAJECTORY_TYPE.DSR) {
        if (isLastIndex) {
          typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
        }
        areaToUse = isLastIndex ? '' : data[rowIndex]?.hypothesis;
      }

      const technology = subIndex === undefined ? undefined : data[rowIndex]?.subRows?.[subIndex]?.hypothesis;

      return await handleTrajectorySearch(typeToUse, setDbTrajectories, studyData.horizon, {
        area: areaToUse,
        technology,
        fileNameContains,
      });
    },
    [data, studyData.horizon, type, setDbTrajectories],
  );

  return { handleSearch };
};
