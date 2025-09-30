import { StudyTrajectoriesData, WarningMessage } from '@/shared/types';
import { StudyStatus } from '../types/common/StudyStatus.type';
import { TRAJECTORY_TYPE } from '../enum/trajectory';
import { buildDataWarningMessage } from '@/shared/utils/warningUtils.ts';

/**
 * Retrieves warning messages for the selected trajectory type from the system's state.
 *
 * The function combines warning messages associated with the active trajectory
 * type and optionally other trajectory types, such as `TRAJECTORY_TYPE.LINK`,
 * depending on the active tab. It also incorporates additional warnings based
 * on the study's generation status.
 *
 * @param {Partial<StudyTrajectoriesData & { studyStatus?: StudyStatus }>} state
 *        The current state contains trajectory data, study status, and associated warnings.
 * @param {TRAJECTORY_TYPE} activeTabName
 *        The currently active trajectory type for which warnings need to be retrieved.
 * @param {number} studyId
 *        The ID of the study is associated with these warning messages.
 * @returns {WarningMessage[]}
 *        Returns an array of warning messages for the given trajectory type and study.
 */
export const getWarningMessages = (
  state: Partial<StudyTrajectoriesData & { studyStatus?: StudyStatus }>,
  activeTabName: TRAJECTORY_TYPE,
  studyId: number,
): WarningMessage[] => {
  const activeTabWarning: WarningMessage[] = state?.[`${activeTabName}`]?.warningMessages ?? [];
  const isNotGenerated = state.studyStatus !== StudyStatus.GENERATED;

  if (activeTabName === TRAJECTORY_TYPE.AREA) {
    const warningLink: WarningMessage[] = state[`${TRAJECTORY_TYPE.LINK}`]?.warningMessages ?? [];
    const dataWarningMessageArea = buildDataWarningMessage(activeTabWarning, activeTabName, isNotGenerated, studyId);
    const dataWarningMessageLink = buildDataWarningMessage(warningLink, TRAJECTORY_TYPE.LINK, isNotGenerated, studyId);
    return dataWarningMessageArea.concat(dataWarningMessageLink);
  } else if (activeTabName === TRAJECTORY_TYPE.THERMAL_CAPACITY) {
    const warningParameters: WarningMessage[] = state[`${TRAJECTORY_TYPE.THERMAL_PARAMETER}`]?.warningMessages ?? [];
    const dataWarningMessageThermalCapacity = buildDataWarningMessage(
      activeTabWarning,
      activeTabName,
      isNotGenerated,
      studyId,
    );
    const dataWarningMessageThermalParameters = buildDataWarningMessage(
      warningParameters,
      TRAJECTORY_TYPE.THERMAL_PARAMETER,
      isNotGenerated,
      studyId,
    );
    return [...dataWarningMessageThermalCapacity, ...dataWarningMessageThermalParameters];
  } else {
    return buildDataWarningMessage(activeTabWarning, activeTabName, isNotGenerated, studyId);
  }
};
