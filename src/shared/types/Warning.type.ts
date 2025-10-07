import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { ButtonColor } from '@/components/button/ButtonWithStdIcon.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { WithNullableFields } from '@/shared/types/Generic.type.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export interface WarningMessage {
  id: number;
  content: string;
  level: WARNING_MESSAGE_LEVEL;
  code: string;
  generatedBy: string;
  generatedAt: Date;
  trajectoryId: number;
  trajectoryName: string;
  secondTrajectory: string;
  isAck: boolean;
}

export interface DataWarningMessage extends WarningMessage {
  studyId: number;
  trajectoryType: TRAJECTORY_TYPE;
  onClickItem: ((id: number) => Promise<void>) | null;
}

export interface CardDataType
  extends WithNullableFields<
    Omit<WarningMessage, 'level' | 'trajectoryId' | 'trajectoryName' | 'secondTrajectory'>,
    'id' | 'content' | 'generatedBy' | 'generatedAt'
  > {
  trajectoryId: number | null;
  trajectoryType: TRAJECTORY_TYPE | null;
  colorStatus: ButtonColor;
  color: string;
  colorBorder: string;
  icon: StdIconId;
  title: string;
  onClickItem: ((id: number) => Promise<void>) | null;
  buttonLabel: string;
  buttonTooltipText: string;
  studyId: number | null;
}

export type WarningTrajectoryType = { [key in keyof typeof TRAJECTORY_TYPE]: number };
