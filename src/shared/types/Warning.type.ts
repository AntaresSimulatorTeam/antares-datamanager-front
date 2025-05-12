import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';

export interface WarningMessage {
  id: number;
  content: string;
  level: WARNING_MESSAGE_LEVEL;
  code: string;
  generatedBy: string;
  generatedAt: Date;
  trajectory: string;
  secondTrajectory: string;
}
