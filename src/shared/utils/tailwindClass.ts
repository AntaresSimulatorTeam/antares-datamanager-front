import { CardDataType } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import clsx from 'clsx';

export const buildLabelColorClass = (status: TRAJECTORY_SELECTION_STATUS): string => {
  if (status === TRAJECTORY_SELECTION_STATUS.OK) {
    return 'text-content-brand-default';
  } else if (status === TRAJECTORY_SELECTION_STATUS.ERROR) {
    return 'text-error-800';
  } else {
    return 'text-content-primary';
  }
};

const COMMON_CARD_CLASSES = "absolute text-gray-600 left-0 flex h-fit flex-col justify-start gap-2 rounded-lg border-b-4 bg-gray-100 shadow-2 p-2";

const getBorderColorClass = (data: CardDataType): string => {
  if (!data.isAck) {
  return data.colorBorder;
  } else if (data.onClickItem == null) {
    return 'border-transparent';
  } else {
    return 'hover:border-b-gray-600';
  }
}

export const buildCardClass = (data: CardDataType) => clsx(COMMON_CARD_CLASSES, !data.isAck || data.onClickItem == null ? 'border-transparent' : 'border-b-gray-600', getBorderColorClass(data));