import {
  buildEmptyRowWithSubRowsData,
  buildEmptyTrajectory,
  buildErrorTrajectory,
  getQueryParamAreaValue,
  setNestedData,
} from '@/shared/utils/trajectoryUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { Dispatch, SetStateAction } from 'react';
import {
  DbTrajectory,
  HypothesisRowData,
  ParamTrajectoryState,
  SelectOption,
  StudyActionType,
  StudyDTO,
  ThermalParamTrajectoryType,
} from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  getStudyTrajectoriesWithWarnings,
} from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';

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
    const area = hypothesis ? getQueryParamAreaValue(type, hypothesis) : '';
    const results = await fetchTrajectoriesFromFS(type, '', area);
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
      },
    },
  });
  const hasSubRows = type === TRAJECTORY_TYPE.THERMAL_CAPACITY;
  const newRow: HypothesisRowData = buildEmptyRowWithSubRowsData(value, hasSubRows);
  setCheckedValues((prev) => [...prev, value]);

  setData((prev) => {
    let updatedData: HypothesisRowData[];
    if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
      const newSubRows = prev?.[0]?.subRows ? sortWithFixedPosition([...prev[0].subRows, newRow]) : [newRow];
      updatedData = [{ ...prev[0], subRows: newSubRows }, ...prev.slice(1)];
    } else {
      updatedData = sortWithFixedPosition([newRow, ...prev]);
    }
    return updatedData;
  });
};

/**
 * Retrieve trajectory and warning messages according to the set of trajectory type provided
 * @param {number} id - Study id
 * @param {ThermalParamTrajectoryType[]} types - Trajectory type for Parameters hypothesis
 */
export const fetchMultipleTrajectoryType = async (
  id: number,
  types: ThermalParamTrajectoryType[],
): Promise<ParamTrajectoryState> => {
  const entries = await Promise.all(
    types.map(async (type) => {
      const result = await getStudyTrajectoriesWithWarnings(id, type);
      return [type, result] as const;
    }),
  );
  return Object.fromEntries(entries) as unknown as ParamTrajectoryState;
};

export const fetchTrajectoriesFromTypes = async (id: number, types: TRAJECTORY_TYPE[]) => {
  const resultObject: Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>> = {};
  await Promise.all(
    types.map(async (thermalType: TRAJECTORY_TYPE) => {
      resultObject[thermalType] = await getStudyTrajectories(id, thermalType);
    }),
  );
  return resultObject;
};
