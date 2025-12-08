import { CheckBoxData, DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { Row } from '@tanstack/react-table';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

/**
 * Return the left padding value for hypothesis table with subRows
 * @param {Row<HypothesisRowData>} row
 */
export const getAlignment = (row: Row<HypothesisRowData>) => {
  if (row.depth === 0) return row.getCanExpand() ? 'pl-0' : 'pl-1';
  return 'pl-4';
};

/**
 * Determines if a hypothesis is a default one
 * @param {number} rowDepth
 * @param {boolean} isDefault
 * @param {string} hypothesis
 * @param {boolean} isTechnology
 * @return {boolean}
 */
export const hasLabelDefault = (
  rowDepth: number,
  isDefault: boolean,
  hypothesis: string,
  isTechnology: boolean,
): boolean => isDefault && hypothesis !== OTHER_AREAS_LABEL && (rowDepth === 0 || (rowDepth === 1 && !isTechnology));

/**
 *
 * @param {{ name: string }[]} defaultAreas
 * @param {TrajectoryAreaData[] | undefined} areas
 */
export const getDefaultAreaNotIncludedInAreaList = (
  defaultAreas: { name: string }[],
  areas: TrajectoryAreaData[] | undefined,
): string[] =>
  (defaultAreas
    ?.map((defaultArea) => {
      if (!areas?.some((trajectoryArea) => trajectoryArea.areaName === defaultArea.name)) {
        return defaultArea.name;
      }
    })
    .filter(Boolean) as string[]) ?? [];

/**
 * Utils method to transform readOnly state for subRow
 * @param {Record<number, boolean>} readOnlyState
 * @returns {Record<number, boolean>}
 */
export const transformToSubRowKeys = (readOnlyState: Record<number, boolean>): Record<string, boolean> => {
  const output: Record<string, boolean> = {};

  for (const key in readOnlyState) {
    if (Object.prototype.hasOwnProperty.call(readOnlyState, key)) {
      const newKey = `0.${key}`;
      output[newKey] = readOnlyState[Number(key)];
    }
  }

  return output;
};

/**
 * Simulates progress over a specified duration, invoking a callback function with the
 * current progress percentage as it updates. The progress is calculated linearly from 0% to 100%.
 *
 * @param {number} duration - The total duration of the simulated progress in milliseconds.
 * @param {(value: number) => void} onProgress - A callback function invoked with the current progress percentage (0 to 100).
 * The progress value represents the completion percentage of the simulation.
 * @returns {Promise<void>} A Promise that resolves when the progress simulation reaches 100%.
 */
export const simulateProgress = async (duration: number, onProgress: (value: number) => void): Promise<void> =>
  new Promise((resolve) => {
    let startTime: number | null = null;

    function updateProgress(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      onProgress(progress);

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(updateProgress);
  });

/**
 * Generates a list of options for areas by combining trajectory area data with default areas.
 *
 * This function filters out any trajectory areas that are already included in the default areas
 * and combines the remaining trajectory areas with the default area options. The result is an
 * array of area option objects, where each object includes the area's name and indicates if
 * the area is default.
 *
 * @param {TrajectoryAreaData[]} trajectoryAreas - The array of trajectory area data to process.
 * @param {{ name: string }[]} [defaultAreas] - An optional array of default areas to be included by default.
 * @returns {CheckBoxData[]} An array of objects representing the combined area options. Each object contains the area's name and an `isDefault` property indicating its default status.
 */
export const buildAreaOptions = (
  trajectoryAreas: TrajectoryAreaData[],
  defaultAreas?: { name: string }[],
): CheckBoxData[] => {
  const newArea: CheckBoxData[] = (trajectoryAreas || [])
    .filter((trajectoryArea) => !defaultAreas?.some((item) => item.name === trajectoryArea.areaName))
    .map((trajectoryArea) => ({
      name: trajectoryArea.areaName,
      isDefault: false,
    }));
  const defaultAreaOptions: CheckBoxData[] = (defaultAreas ?? []).map((area) => ({
    name: area.name,
    isDefault: true,
  }));
  return [...defaultAreaOptions, ...newArea];
};

/**
 * Constructs a list of checked values by combining areas from a trajectory dataset
 * with a default list of areas, ensuring no duplicates exist.
 *
 * @param {DbTrajectory[]} areaWithTrajectory - Array of trajectory objects, each containing area information.
 * @param {{ name: string }[]} [defaultAreas] - Optional array of default area objects with a "name" property.
 * @returns {string[]} A combined list of area names, prioritizing default areas,
 *     and excluding duplicates from the trajectory areas.
 */
export const buildCheckValuesList = (
  areaWithTrajectory: DbTrajectory[],
  defaultAreas?: { name: string }[],
): string[] => {
  const areasValuesChecked: string[] = (areaWithTrajectory ?? [])
    .filter((trajectoryArea) => !defaultAreas?.some((item) => item.name === trajectoryArea.area))
    .map((trajectory) => trajectory.area);
  const defaultCheckedValues = (defaultAreas ?? []).map((item) => item.name);

  return [...defaultCheckedValues, ...areasValuesChecked];
};

/**
 * Generates a checklist box configuration based on provided trajectory data, areas,
 * and default area information. The function combines areas with and without a trajectory,
 * default area definitions, and calculates the corresponding checked values.
 *
 * @param {DbTrajectory[]} areaWithTrajectory - The list of trajectory data which includes
 * the areas to process, typically with trajectory-related information.
 *
 * in the checklist configuration.
 *
 * @param {TrajectoryAreaData[]} trajectoryAreas - List of areas contains in the trajectory AREA
 * @param {{ name: string }[]} [defaultAreas] - An optional list of default areas represented by objects
 * containing their names, used to differentiate between user-defined and system-provided areas.
 *
 * @returns {{ areaOptions: CheckBoxData[]; checkedValues: string[] }} An object containing:
 * - `areaOptions`: An array describing available checklist options with additional metadata for each area.
 * - `checkedValues`: A list of names representing the pre-selected areas in the checklist configuration.
 */
export const buildCheckListBox = (
  areaWithTrajectory: DbTrajectory[],
  trajectoryAreas: TrajectoryAreaData[],
  defaultAreas?: { name: string }[],
): { areaOptions: CheckBoxData[]; checkedValues: string[] } => {
  const areaOptions: CheckBoxData[] = buildAreaOptions(trajectoryAreas, defaultAreas);
  const checkedValues: string[] = buildCheckValuesList(areaWithTrajectory, defaultAreas);
  return { areaOptions, checkedValues };
};
