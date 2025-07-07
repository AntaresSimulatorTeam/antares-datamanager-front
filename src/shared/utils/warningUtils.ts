import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { CardDataType, DataWarningMessage, DbTrajectory, StudyState, WarningMessage } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { discardWarningMessage } from '@/shared/services/warningService.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

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

export const convertDataToItem = <T>(data: T, t: (value: string) => string): CardDataType => {
  const {
    id = null,
    trajectory = null,
    secondTrajectory = null,
    content = null,
    generatedBy = null,
    generatedAt = null,
    isAck = false,
    onClickItem = null,
    trajectoryType = null,
    trajectoryId = null,
  } = data || {};

  return {
    code: '',
    colorStatus: 'warning',
    color: 'text-warning-500',
    colorBorder: 'hover:border-b-acc6-500',
    icon: StdIconId.Warning,
    title: `${trajectory ?? ''} ${secondTrajectory ? ' - ' : ''} ${secondTrajectory || ''}`,
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
  };
};

export const buildWarningMessageData = (
  message: WarningMessage,
  trajectory: DbTrajectory,
  tabName: TRAJECTORY_TYPE,
  isNotGenerated: boolean,
): DataWarningMessage => ({
  ...message,
  trajectoryId: trajectory.id,
  trajectoryType: tabName,
  trajectory: trajectory.trajectoryName,
  onClickItem: isNotGenerated ? discardWarningMessage : null,
});

export const buildMessagesByType = (
  trajectory: DbTrajectory,
  tabName: TRAJECTORY_TYPE,
  isNotGenerated: boolean,
): DataWarningMessage[] =>
  (trajectory.messages || []).map((message) => buildWarningMessageData(message, trajectory, tabName, isNotGenerated));

export const buildWarningMessages = (
  studyState: Partial<StudyState>,
  tabName: TRAJECTORY_TYPE,
): DataWarningMessage[] => {
  let messages: DataWarningMessage[] = [];
  const trajectories: DbTrajectory[] | null = studyState[tabName] ?? null;
  const isStudyGenerated = studyState.studyStatus !== StudyStatus.GENERATED;
  if (trajectories && trajectories.length > 0) {
    messages = trajectories.flatMap((trajectory) => buildMessagesByType(trajectory, tabName, isStudyGenerated));
  }
  if (tabName === TRAJECTORY_TYPE.AREA && studyState.LINK) {
    const linkMessage: DataWarningMessage[] = buildMessagesByType(studyState?.LINK?.[0], tabName, isStudyGenerated);
    return messages.length > 0 && linkMessage?.length > 0 ? messages.concat(linkMessage) : linkMessage;
  } else {
    return messages;
  }
};
