import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { CardDataType, DataWarningMessage, WarningMessage, WarningTrajectoryType } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

/**
 * Sort the messages list according to the warning level (typeof WARNING_MESSAGE_LEVEL)
 *
 * @param {WarningMessage} a - Warning message
 * @param {WarningMessage} b - Warning message
 * @return {number}
 */
export const sortByLevel = (a: WarningMessage, b: WarningMessage): number => {
  const map: Map<WARNING_MESSAGE_LEVEL, number> = new Map();
  map.set(WARNING_MESSAGE_LEVEL.ERROR_LEVEL, 0);
  map.set(WARNING_MESSAGE_LEVEL.WARNING_LEVEL, 1);
  map.set(WARNING_MESSAGE_LEVEL.INFO_LEVEL, 2);
  map.set(WARNING_MESSAGE_LEVEL.FATAL_LEVEL, 3);

  if (map.get(a.level) !== undefined && map.get(b.level) !== undefined) {
    if (map.get(a.level)! < map.get(b.level)!) {
      return -1;
    }
    if (map.get(a.level)! > map.get(b.level)!) {
      return 1;
    }
  }
  return 0;
};

/**
 * Convert message warning DTO into DataWarningMessage object according to trajectory type
 * @param {WarningMessage} messages
 * @param {TRAJECTORY_TYPE} tabName - Tab name is defined as typeof TRAJECTORY_TYPE
 * @param {boolean} isNotGenerated
 * @param {number} studyId
 * @param {(id: number, trajectoryType: TRAJECTORY_TYPE, studyId: number) => Promise<void>} handleClickItem
 * @return {DataWarningMessage[]} - Data that can be used into card component
 */
export const buildDataWarningMessage = (
  messages: WarningMessage[],
  tabName: TRAJECTORY_TYPE,
  isNotGenerated: boolean,
  studyId: number,
  handleClickItem: ((id: number, trajectoryType: TRAJECTORY_TYPE, studyId: number) => Promise<void>) | null,
): DataWarningMessage[] =>
  (messages || []).map((message: WarningMessage) => ({
    ...message,
    trajectoryType: tabName,
    onClickItem: isNotGenerated ? handleClickItem : null,
    studyId,
  }));

/**
 * Transforms the input data object into a structured `CardDataType` object.
 *
 * @template T
 * @param {T} data - The input data object containing information to be transformed.
 * @param {(value: string) => string} t - A translation function to localize specific text values.
 * @returns {CardDataType} A `CardDataType` object containing structured and formatted properties based on the input data.
 */
export const convertDataToItem = <T>(data: T, t: (value: string) => string): CardDataType => {
  const {
    id = null,
    trajectoryName = null,
    secondTrajectory = null,
    content = null,
    generatedBy = null,
    generatedAt = null,
    isAck = false,
    onClickItem = null,
    trajectoryType = null,
    trajectoryId = null,
    studyId = null,
  } = data || {};

  return {
    code: '',
    colorStatus: 'warning',
    color: 'text-warning-500',
    colorBorder: 'hover:border-b-acc6-500',
    icon: StdIconId.Warning,
    title: `${trajectoryName ?? ''} ${secondTrajectory ? '-' : ''} ${secondTrajectory ?? ''}`,
    buttonLabel: isAck ? t('studyDetails.@skipped') : t('studyDetails.@skip'),
    buttonTooltipText: t('studyDetails.@warningButtonTooltip'),
    trajectoryId,
    trajectoryType,
    id,
    content,
    generatedBy,
    generatedAt,
    isAck,
    onClickItem,
    studyId,
  };
};

/**
 * Computes the count of warnings based on the warning trajectory type and the tab name.
 *
 * @param {WarningTrajectoryType} warning - The object containing warning counts for different trajectory types.
 * @param {TRAJECTORY_TYPE} tabName - The trajectory type for which the warning count needs to be calculated.
 * @returns {number} - The total warning count for the specified trajectory type.
 */
export const countWarning = (warning: WarningTrajectoryType, tabName: TRAJECTORY_TYPE) => {
  if (tabName === TRAJECTORY_TYPE.AREA) {
    return +warning[TRAJECTORY_TYPE.AREA] + +warning[TRAJECTORY_TYPE.LINK];
  } else {
    return warning[tabName] ?? 0;
  }
};
