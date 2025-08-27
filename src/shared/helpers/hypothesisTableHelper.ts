import { HypothesisRowData } from '@/shared/types';
import { retrieveReadOnlyArea } from '@/shared/utils/trajectoryUtils.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';

/**
 * Retrieve read only row of a study generated
 * @param {HypothesisRowData[]} rows
 * @return {ReadOnlyObject}
 */
export const getReadOnlyForGeneratedStudy = (rows: HypothesisRowData[]): ReadOnlyObject => {
  console.log('================ rows', rows);
  const areaWithoutTrajectory = rows
    .map((row) => (row.trajectory == null ? row.hypothesis : null))
    .filter(Boolean) as string[];
  return retrieveReadOnlyArea(rows, areaWithoutTrajectory);
};

/**
 * Return boolean to indicate if the deletion modal should open
 * @param {TRAJECTORY_TYPE} type
 * @param {number} indexRow
 * @param {HypothesisRowData[]} data
 * @return {boolean} True if a trajectory is linked to an area for all trajectory type (expect THERMAL_CAPACITY) or at least two trajectories linked to one area and to one technology
 */
export const shouldOpenDeletionModal = (
  type: TRAJECTORY_TYPE,
  indexRow: number,
  data: HypothesisRowData[],
): boolean => {
  const hasTrajectoryLinkedToTechnology =
    indexRow != null
      ? (data[indexRow]?.subRows || [])?.some(
          (item: HypothesisRowData) => item.trajectory && item.status === TRAJECTORY_SELECTION_STATUS.OK,
        )
      : false;
  const hasTrajectoryLinkedToArea =
    indexRow != null
      ? !!(data[indexRow]?.trajectory && data[indexRow]?.status === TRAJECTORY_SELECTION_STATUS.OK)
      : false;

  return (
    (hasTrajectoryLinkedToArea && type !== TRAJECTORY_TYPE.THERMAL_CAPACITY) ||
    (hasTrajectoryLinkedToArea && hasTrajectoryLinkedToTechnology)
  );
};
