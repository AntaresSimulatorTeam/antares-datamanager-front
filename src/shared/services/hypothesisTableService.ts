import {
  buildEmptyTrajectory,
  buildErrorTrajectory,
  buildRowWithSubRows,
  getQueryParamAreaValue,
  setNestedData,
} from '@/shared/utils/trajectoryUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { Dispatch, SetStateAction } from 'react';
import {
  DbTrajectory,
  HypothesisRowData,
  isTrajectorySubrowsType,
  ParamTrajectoryState,
  SelectOption,
  StudyActionType,
  ThermalParamTrajectoryType,
  TrajectoryViewData,
} from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
import {
  fetchTrajectoriesFromDB,
  fetchTrajectoriesFromFS,
  getStudyTrajectoriesWithWarnings,
  getTrajectoryDataByTypeAndId,
} from '@/shared/services/trajectoryService.ts';
import { convertToFSSelectionOptionType, convertToSelectionOptionType } from '@/shared/utils/formFormatter.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { generateTrajectoryViewHeader } from '@/components/header/TrajectoryViewHeader.tsx';
import { TFunction } from 'i18next';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { getSchemeData } from '@/shared/utils/hypothesisTableUtils.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { computeDsrDataAndReadOnly } from '@/shared/helpers/hypothesisTableHelper.ts';
import { TrajectorySearchParams } from '@/shared/types/HypothesisTable.ts';

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
    icon: 'close',
    message: alert.message,
    content: alert.content,
    type: 'error',
    filledIcon: true,
  });
};

/**
 * Handles the process of fetching trajectories from a data source and updating related state.
 *
 * @async
 * @function handleFetchTrajectoriesFS
 * @param {TRAJECTORY_TYPE} type - The type of trajectory to fetch. Determines the context or criteria for the query.
 * @param {string} rowId - The unique identifier for the row being processed or selected.
 * @param {Dispatch<SetStateAction<SelectOption[] | undefined>>} setOptionsFS - State dispatcher for updating the options available after fetching trajectories.
 * @param {Dispatch<SetStateAction<string>>} setRowIdSelected - State dispatcher for updating the selected row ID after processing.
 * @param {Function} toggleModal - A function to toggle the visibility of a modal, typically used to display or hide UI elements during or after the process.
 * @param {string} hypothesis - An optional parameter representing a hypothesis that determines additional query parameters.
 * @param isDefaultArea
 * @returns {Promise<void>} Resolves to no value upon successful completion of the operation.
 * @throws Will silently handle errors during data fetching or processing without throwing or exposing exceptions.
 */
export const handleFetchTrajectoriesFS = async (
  type: TRAJECTORY_TYPE,
  rowId: string,
  setOptionsFS: Dispatch<SetStateAction<SelectOption[] | undefined>>,
  setRowIdSelected: Dispatch<SetStateAction<string>>,
  toggleModal: () => void,
  hypothesis?: string,
  isDefaultArea = false,
): Promise<void> => {
  try {
    const area = getQueryParamAreaValue(type, hypothesis);
    const results = area ? await fetchTrajectoriesFromFS(type, area) : await fetchTrajectoriesFromFS(type);
    setOptionsFS(convertToFSSelectionOptionType(results, isDefaultArea));
    setRowIdSelected(rowId);
    toggleModal();
  } catch {
    // Silent handler
  }
};

/**
 * Asynchronously handles the search for trajectories based on the provided parameters.
 *
 * @param {TRAJECTORY_TYPE} type - The type of trajectory to be searched.
 * @param {Dispatch<SetStateAction<DbTrajectory[]>>} setDbTrajectories - A state updater function
 * used to set the retrieved database trajectories.
 * @param {string} studyHorizon - Study horizon
 * @param {{ area?: string; technology?: string; fileNameContains?: string }} options - options for searching area in BDD (area, technology or search term)
 * @param {string | undefined} options.area - The area or region to scope the search.
 * @param {string | undefined} options.technology - An optional parameter specifying the technology associated with the trajectory.
 * @param {string | undefined} options.fileNameContains - The value used as a search filter.
 *
 * @returns {Promise<SelectOption[] | undefined>} A Promise resolving to an array of selection options
 * converted from the search results, or undefined in case of an error.
 */
export const handleTrajectorySearch = async (
  type: TRAJECTORY_TYPE,
  setDbTrajectories: Dispatch<SetStateAction<DbTrajectory[]>>,
  studyHorizon: string,
  options: TrajectorySearchParams,
): Promise<SelectOption[] | undefined> => {
  try {
    if (options?.area && options.area === OTHER_AREAS_LABEL) {
      options.area = OTHER_AREAS;
    }
    const results = await fetchTrajectoriesFromDB(type, studyHorizon, options);
    setDbTrajectories(results);
    return convertToSelectionOptionType(results);
  } catch {
    // silent handler
  }
};

/**
 * Updates the application state by adding a new trajectory row and handling associated logic.
 *
 * @param {TRAJECTORY_TYPE} type - The type of trajectory to be added. Used to determine the structure of the row and sub-rows.
 * @param area
 * @param {Dispatch<StudyActionType> | null} dispatch - Dispatch function to update the study state. If null, the dispatch operation is skipped.
 * @param {Dispatch<SetStateAction<string[]>>} setCheckedValues - State update function for maintaining the checked values in the UI.
 * @param {Dispatch<SetStateAction<HypothesisRowData[]>>} setData - State update function for maintaining the overall row data structure.
 * @param {string[]} options - Options list for TRAJECTORY_TYPE.THERMAL_CAPACITY or TRAJECTORY_TYPE.STS type
 * @param {{ name: string }[]} defaultAreas
 * @param {Dispatch<SetStateAction<ReadOnlyObject>>} setReadOnly - State update function for maintaining the readonly lines.
 * @returns {void}
 */
export const addRow = (
  type: TRAJECTORY_TYPE,
  area: string,
  dispatch: Dispatch<StudyActionType> | null,
  setCheckedValues: Dispatch<SetStateAction<string[]>>,
  setData: Dispatch<SetStateAction<HypothesisRowData[]>>,
  options?: string[],
  defaultAreas?: { name: string }[],
  setReadOnly?: Dispatch<SetStateAction<ReadOnlyObject>>,
): void => {
  dispatch?.({
    type: STUDY_ACTION.ADD_TRAJECTORIES,
    payload: {
      [type]: {
        trajectories: [buildEmptyTrajectory(area, type)],
      },
    },
  });

  const subRows = isTrajectorySubrowsType(type) && options ? options : [];
  const newRow: HypothesisRowData = buildRowWithSubRows({
    hypothesis: area,
    trajectory: null,
    options: subRows,
    defaultAreas,
    areasNotInTrajectoryArea: [],
  });
  setCheckedValues((prev) => [...prev, area]);

  setData((prev) => {
    let updatedData: HypothesisRowData[];
    if (type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER) {
      const newSubRows = prev?.[0]?.subRows ? sortWithFixedPosition([...prev[0].subRows, newRow]) : [newRow];
      updatedData = [{ ...prev[0], subRows: newSubRows }, ...prev.slice(1)];
    } else if (type === TRAJECTORY_TYPE.DSR) {
      const rest = prev.slice(0, -1);
      const sorted = sortWithFixedPosition([newRow, ...rest]);
      const { data, readOnlyPatch, indexesToClear } = computeDsrDataAndReadOnly(prev, sorted);
      updatedData = data;
      setReadOnly?.((prevItems) => {
        const next = { ...prevItems };
        indexesToClear.forEach((i) => delete next[i]);
        Object.entries(readOnlyPatch).forEach(([key, value]) => {
          next[key] = value;
        });

        return next;
      });
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

/**
 * Fetches trajectories for a given study ID and a list of trajectory types.
 *
 * This asynchronous function retrieves trajectory data for the specified trajectory types
 * and study ID. The results are returned in an object where each key corresponds to a
 * trajectory type, and the value is an array of database trajectory objects associated
 * with that type.
 *
 * @param {number} id - The unique identifier for the study.
 * @param {TRAJECTORY_TYPE[]} types - An array of trajectory types to fetch trajectories for.
 * @returns {Promise<Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>>>} A promise resolving to an object that maps trajectory types to their respective array of database trajectories.
 */
export const fetchTrajectoriesFromTypes = async (
  id: number,
  types: TRAJECTORY_TYPE[],
): Promise<Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>> | undefined> => {
  try {
    const resultObject: Partial<Record<TRAJECTORY_TYPE, DbTrajectory[]>> = {};
    await Promise.all(
      types.map(async (thermalType: TRAJECTORY_TYPE) => {
        resultObject[thermalType] = await getStudyTrajectories(id, thermalType);
      }),
    );
    return resultObject;
  } catch {
    //Silent handler
  }
};

/**
 * Handles fetching and preparing trajectory data for viewing.
 *
 * @async
 * @function handleViewTrajectory
 * @param {DbTrajectory} trajectory - The trajectory object containing type and ID information.
 * @param {Dispatch<SetStateAction<TrajectoryViewData | undefined>>} setTrajectoryData - Function to update the state with trajectory data and related information.
 * @param {Dispatch<SetStateAction<boolean>>} setIsViewModalOpen - Function to update the state controlling the visibility of the view modal.
 * @param {TFunction<"translation", undefined>} t - Translation function for localizing column headers.
 * @returns {Promise<void>} Resolves when the trajectory data has been successfully fetched and state updated, or does nothing on error.
 * @description This function retrieves trajectory data by its type and ID and prepares it for display by generating localized column headers. It updates the necessary state to display the data in a view modal. Errors are silently ignored.
 */
export const handleViewTrajectory = async (
  trajectory: DbTrajectory,
  setTrajectoryData: Dispatch<SetStateAction<TrajectoryViewData | undefined>>,
  setIsViewModalOpen: Dispatch<SetStateAction<boolean>>,
  t: TFunction<'translation', undefined>,
): Promise<void> => {
  try {
    const results = await getTrajectoryDataByTypeAndId(trajectory.type, trajectory.id);
    const scheme = getSchemeData(trajectory.type);
    const size = trajectory.type === TRAJECTORY_TYPE.AREA ? 350 : 128;
    const columns = generateTrajectoryViewHeader(scheme, t, size);
    setTrajectoryData({
      trajectory,
      data: results,
      columns,
    });
    setIsViewModalOpen(true);
  } catch {
    //Silent error
  }
};
