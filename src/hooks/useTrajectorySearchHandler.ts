import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { DbTrajectory, HypothesisRowData, SelectOption, StudyDTO, TechnologyType } from '@/shared/types';
import { handleTrajectorySearch } from '@/shared/services/hypothesisTableService.ts';

interface UseTrajectorySearchHandlerArgs {
  data: HypothesisRowData[];
  type: TRAJECTORY_TYPE;
  studyData: StudyDTO;
  setDbTrajectories: Dispatch<SetStateAction<DbTrajectory[]>>;
  technologies?: TechnologyType[];
}

export const useTrajectorySearchHandler = ({
  data,
  type,
  studyData,
  setDbTrajectories,
  technologies,
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
      if (type === TRAJECTORY_TYPE.HYDRO_SERIES && indexArray.length === 2 && subIndex === 1) {
        typeToUse = TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS;
      }

      if (type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES && indexArray.length === 2 && subIndex === 1) {
        typeToUse = TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS;
      }

      let technology =
        subIndex === undefined || type === TRAJECTORY_TYPE.HYDRO_SERIES || type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES
          ? undefined
          : data[rowIndex]?.subRows?.[subIndex]?.hypothesis;
      const option = technologies ? technologies.find((opt) => opt.label === technology) : null;
      if (option) {
        technology = option.code;
      }
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
