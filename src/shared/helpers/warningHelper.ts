import { DataWarningMessage, DbTrajectory, StudyState } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { buildDataWarningMessage } from '@/shared/utils/warningUtils.ts';

/**
 *
 * @param studyState
 * @param tabName
 */
export const buildWarningMessages = (
  studyState: Partial<StudyState>,
  tabName: TRAJECTORY_TYPE,
): DataWarningMessage[] => {
  const trajectories: DbTrajectory[] | null = studyState[tabName] ?? null;
  const isStudyGenerated = studyState.studyStatus !== StudyStatus.GENERATED;
  const messages = (trajectories || []).flatMap((trajectory) =>
    buildDataWarningMessage(trajectory, tabName, isStudyGenerated),
  );
  if (tabName === TRAJECTORY_TYPE.AREA && studyState.LINK) {
    const linkMessage: DataWarningMessage[] = buildDataWarningMessage(studyState?.LINK?.[0], tabName, isStudyGenerated);
    return messages.length > 0 && linkMessage?.length > 0 ? messages.concat(linkMessage) : linkMessage;
  } else {
    return messages;
  }
};
