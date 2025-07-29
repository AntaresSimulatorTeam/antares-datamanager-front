import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { CardDataType, DataWarningMessage, StudyState, WarningMessage } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { discardWarningMessage } from '@/shared/services/warningService.ts';

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
 * @return {DataWarningMessage[]} - Data that can be used into card component
 */
export const buildDataWarningMessage = (
  messages: WarningMessage[],
  tabName: TRAJECTORY_TYPE,
  isNotGenerated: boolean,
  studyId: number,
): DataWarningMessage[] =>
  (messages || []).map((message: WarningMessage) => ({
    ...message,
    trajectoryType: tabName,
    onClickItem: isNotGenerated ? discardWarningMessage : null,
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
 * Calculates the total number of warning messages for a specified tab in the study state.
 *
 * This function assesses the count of warning messages within a given `tabName` in the study state.
 * If the `tabName` corresponds to the `TRAJECTORY_TYPE.AREA`, it aggregates the warning messages
 * from both the `AREA` and `LINK` trajectory types.
 *
 * @param {Partial<StudyState>} studyState - The current state of the study, which includes warning messages for various trajectory types.
 * @param {TRAJECTORY_TYPE} tabName - The trajectory type or tab name for which the warnings are being evaluated.
 * @returns {number} The total count of warning messages for the given tab or, in the case of an `AREA` tab, for the combined `AREA` and `LINK` trajectory types.
 */
export const countWarning = (studyState: Partial<StudyState>, tabName: TRAJECTORY_TYPE): number => {
  const warningMessages = studyState[tabName]?.warningMessages;

  if (tabName === TRAJECTORY_TYPE.AREA) {
    const areaWarnings = studyState[TRAJECTORY_TYPE.AREA]?.warningMessages?.length ?? 0;
    const linkWarnings = studyState[TRAJECTORY_TYPE.LINK]?.warningMessages?.length ?? 0;
    return areaWarnings + linkWarnings;
  }

  return warningMessages?.length ?? 0;
};
