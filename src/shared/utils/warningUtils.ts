import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { CardDataType, DbTrajectory, StudyState, WarningMessage } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

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

export const getMessagesNb = (studyState: Partial<StudyState>, tabName: TRAJECTORY_TYPE): number => {
  let warmingMessagesNb: number = 0;
  if (tabName === TRAJECTORY_TYPE.AREA) {
    warmingMessagesNb =
      ((studyState?.[`${TRAJECTORY_TYPE.AREA}`]?.[0] as DbTrajectory)?.messages?.length ?? 0) +
      ((studyState?.[`${TRAJECTORY_TYPE.LINK}`]?.[0] as DbTrajectory)?.messages?.length ?? 0);
  } else if (studyState?.[`${tabName}`]) {
    warmingMessagesNb =
      (studyState?.[`${tabName}`] as DbTrajectory[])?.reduce((acc, prev) => acc + prev.messages?.length, 0) ?? 0;
  }
  return warmingMessagesNb;
};
