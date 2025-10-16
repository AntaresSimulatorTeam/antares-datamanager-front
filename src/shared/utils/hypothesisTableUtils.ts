import { CheckBoxData, DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { Row } from '@tanstack/react-table';
import { isTechnology } from '@/shared/utils/trajectoryUtils.ts';
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
 */
export const hasLabelDefault = (rowDepth: number, isDefault: boolean, hypothesis: string) => {
  if (rowDepth === 1 && isDefault && !isTechnology(hypothesis) && hypothesis !== OTHER_AREAS_LABEL) return true;
  return rowDepth === 0 && isDefault && hypothesis !== OTHER_AREAS_LABEL;
};

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

export const buildCheckListBox = (
  areaWithTrajectory: DbTrajectory[],
  areas?: TrajectoryAreaData[],
  defaultAreas?: { name: string }[],
) => {
  const newArea = (areas || [])
    .map((trajectoryArea) => {
      if (!defaultAreas?.some((item) => item.name === trajectoryArea.areaName)) {
        return { name: trajectoryArea.areaName, isDefault: false };
      }
    })
    .filter(Boolean) as CheckBoxData[];
  const areaOptions = defaultAreas?.map((area) => ({ name: area.name, isDefault: true }))?.concat(newArea);

  const checkList = areaWithTrajectory
    ?.map((trajectory) => {
      if (trajectory.area) {
        return trajectory.area;
      }
    })
    .filter(Boolean) as string[];
  const checkedValues = defaultAreas?.map((item) => item.name).concat(checkList);
  return { areaOptions, checkedValues };
};
