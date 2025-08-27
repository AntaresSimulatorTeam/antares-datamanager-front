import { buildEmptyTrajectory, buildErrorTrajectory, setNestedData } from '@/shared/utils/trajectoryUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { Dispatch, SetStateAction } from 'react';
import { DbTrajectory, HypothesisRowData, SelectOption, StudyActionType, StudyDTO } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import { fetchTrajectoriesFromDB, fetchTrajectoriesFromFS } from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';

export const handleTrajectoryError = (
  type: TRAJECTORY_TYPE,
  rowIndex: number[],
  trajectory: { id: number; label: string },
  hypothesis: string,
  userName: string,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  alert: { message: string; content: string },
) => {
  setData((prev) =>
    setNestedData(prev, rowIndex, {
      trajectory: buildErrorTrajectory(type, trajectory.id, trajectory.label, userName, hypothesis),
      status: TRAJECTORY_SELECTION_STATUS.ERROR,
    }),
  );

  notifyAlert({
    icon: StdIconId.Close,
    message: alert.message,
    content: alert.content,
    type: 'error',
    filledIcon: true,
  });
};

export const handleFetchTrajectoriesFS = async (
  type: TRAJECTORY_TYPE,
  rowId: string,
  setOptionsFS: Dispatch<SetStateAction<SelectOption[] | undefined>>,
  setRowIdSelected: Dispatch<SetStateAction<string>>,
  toggleModal: () => void,
  hypothesis?: string,
): Promise<void> => {
  try {
    const results = await fetchTrajectoriesFromFS(type, '', hypothesis);
    setOptionsFS(convertToFSSelectionOptionType(results));
    setRowIdSelected(rowId);
    toggleModal();
  } catch {
    // Silent handler
  }
};

export const handleTrajectorySearch = async (
  type: TRAJECTORY_TYPE,
  value: string,
  area: string,
  setDbTrajectories: Dispatch<SetStateAction<DbTrajectory[]>>,
  study: StudyDTO,
  technology?: string,
): Promise<SelectOption[] | undefined> => {
  try {
    const results = await fetchTrajectoriesFromDB(type, study.horizon, value, area, technology);
    setDbTrajectories(results);
    return convertToSelectionOptionType(results);
  } catch {
    // silent handler
  }
};

export const addRow = (
  type: TRAJECTORY_TYPE,
  value: string,
  dispatch: Dispatch<StudyActionType> | null,
  setCheckedValues: Dispatch<SetStateAction<string[]>>,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
): void => {
  dispatch?.({
    type: STUDY_ACTION.ADD_TRAJECTORIES,
    payload: {
      [type]: {
        trajectories: [buildEmptyTrajectory(value, type)],
        warningMessages: [],
      },
    },
  });
  const hasSubRows = type === TRAJECTORY_TYPE.THERMAL_CAPACITY;
  const newRow: HypothesisRowData = {
    hypothesis: value,
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    isDefault: false,
    subRows: hasSubRows
      ? ThermalOptions.map((option) => ({
          hypothesis: option,
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          subRows: null,
        }))
      : null,
  };
  setCheckedValues((prev) => [...prev, value]);
  setData((prev) => sortWithFixedPosition([newRow, ...prev]));
};
