import { CardDataType } from '@common/layout/CardWithIconTitle.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ERROR_MESSAGE_TYPE, WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { DbTrajectory, ErrorMessage, StudyState, WarningMessage } from '@/shared/types';
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

export const convertDataToItem = <T>(data: T): CardDataType => {
  const {
    level = WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    trajectory = null,
    secondTrajectory = null,
    content = null,
    generatedBy = null,
    generatedAt = null,
  } = data || {};

  return {
    colorStatus: level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL ? 'warning' : 'danger',
    color: level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL ? 'text-warning-500' : 'text-error-700',
    colorBorder: level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL ? 'hover:border-acc6-500' : 'hover:border-acc4-700',
    icon: level === WARNING_MESSAGE_LEVEL.WARNING_LEVEL ? StdIconId.Warning : StdIconId.Info,
    title: `${trajectory ?? ''} ${secondTrajectory ? ' - ' : ''} ${secondTrajectory || ''}`,
    content,
    generatedBy,
    generatedAt,
  };
};

export const getErrorMessage = async (response: Response): Promise<{ message: string }> => {
  const errorData = (await response.json()) as unknown as Error | ErrorMessage;
  if (
    response.status === 400 &&
    'antaresErrorMessage' in errorData &&
    (errorData as ErrorMessage)?.type === ERROR_MESSAGE_TYPE.BUSINESS
  ) {
    const messageText = (errorData as ErrorMessage).antaresErrorMessage as string;
    return { message: messageText };
  } else {
    return { message: (errorData as Error).message };
  }
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
