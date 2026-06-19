import { Dispatch, SetStateAction, useCallback } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { HypothesisRowData, SelectOption } from '@/shared/types';
import { handleFetchTrajectoriesFS } from '@/shared/services/hypothesisTableService.ts';

interface UseTrajectoryFetchFromFSHandlerArgs {
  defaultAreas: { name: string }[];
  setOptionsFS: Dispatch<SetStateAction<SelectOption[] | undefined>>;
  setRowIdSelected: Dispatch<SetStateAction<string>>;
  toggleModal: () => void;
}

export const useTrajectoryFetchFromFSHandler = ({
  defaultAreas,
  setOptionsFS,
  setRowIdSelected,
  toggleModal,
}: UseTrajectoryFetchFromFSHandlerArgs) => {
  const handleFetchFromFS = useCallback(
    async (type: TRAJECTORY_TYPE, data: HypothesisRowData[], rowId: string) => {
      const indexArray = rowId.split('.').map(Number);
      let typeToUse = type;
      let areaToUse = data[indexArray[0]]?.hypothesis;
      let isDefaultArea = defaultAreas?.some((area) => area.name === data[indexArray[0]]?.hypothesis);
      const isLastIndex = indexArray[0] === Math.max(data.length - 1, 0);
      if (type === TRAJECTORY_TYPE.AREA) {
        typeToUse = indexArray[0] === 0 ? TRAJECTORY_TYPE.AREA : TRAJECTORY_TYPE.LINK;
        areaToUse = '';
      }
      if (type === TRAJECTORY_TYPE.DSR) {
        if (isLastIndex) typeToUse = TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION;
        areaToUse = '';
        isDefaultArea = false;
      }
      if (type === TRAJECTORY_TYPE.STS) {
        areaToUse = data[indexArray[0]]?.subRows?.[indexArray[1]]?.hypothesis ?? '';
      }
      if (type === TRAJECTORY_TYPE.HYDRO_SERIES) {
        typeToUse = indexArray[1] === 0 ? TRAJECTORY_TYPE.HYDRO_SERIES : TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS;
        areaToUse = '';
      }
      if (type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES) {
        typeToUse =
          indexArray[1] === 0 ? TRAJECTORY_TYPE.HYDRO_PSP_SERIES : TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS;
        areaToUse = '';
      }
      await handleFetchTrajectoriesFS(
        typeToUse,
        rowId,
        setOptionsFS,
        setRowIdSelected,
        toggleModal,
        areaToUse,
        isDefaultArea,
      );
    },
    [defaultAreas, setOptionsFS, setRowIdSelected, toggleModal],
  );
  return { handleFetchFromFS };
};
