import { CardDataType } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';

export const buildLabelColorClass = (isReadOnly: boolean, status: TRAJECTORY_SELECTION_STATUS): string => `${isReadOnly ? 'text-content-disabled' : status === TRAJECTORY_SELECTION_STATUS.OK ? 'text-content-brand-default' : status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'text-error-800' : 'text-content-primary'}`;

export const buildCardClass = (data: CardDataType) => `absolute text-gray-600 left-0 flex h-fit flex-col justify-start gap-2 rounded-lg border-b-4 bg-gray-100 shadow-2 ${!data.isAck || data.onClickItem == null ? 'border-transparent' : 'border-b-gray-600'} ${!data.isAck ? data.colorBorder : data.onClickItem == null ? 'border-transparent' : 'hover:border-b-gray-600'} p-2`;