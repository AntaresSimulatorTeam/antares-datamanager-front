import { DataWarningMessage, WarningMessage } from '@/shared/types';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export const mockSingleWarningMessages: WarningMessage = {
  id: 1,
  content:
    'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
  level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
  code: 'LINKS_AREA_NOT_PRESENT',
  generatedBy: 'unknown_user',
  generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
  trajectoryId: 105,
  trajectoryName: 'areas_BP23_A_ref',
  secondTrajectory: 'links_BP23_A_ref',
  isAck: false,
};

export const mockSingleWarningMessagesSkipped: WarningMessage = {
  id: 1,
  content:
    'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
  level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
  code: 'LINKS_AREA_NOT_PRESENT',
  generatedBy: 'unknown_user',
  generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
  trajectoryId: 123,
  trajectoryName: 'areas_BP23_A_ref',
  secondTrajectory: 'links_BP23_A_ref',
  isAck: true,
};

export const mockWarningMessagesWithTwo: WarningMessage[] = [
  {
    id: 1,
    content:
      'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 104,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
  {
    id: 2,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 104,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
];

export const mockWarningMessages: WarningMessage[] = [
  {
    id: 1,
    content:
      'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 105,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
  {
    id: 2,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 105,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
  {
    id: 3,
    content: 'this is an error message',
    level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 105,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
  {
    id: 4,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 105,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
  {
    id: 5,
    content:
      'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 105,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
  {
    id: 6,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 105,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
  {
    id: 7,
    content: 'this is an error message',
    level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 105,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
  {
    id: 8,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    trajectoryId: 105,
    trajectoryName: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
];

export const mockDataMessage: DataWarningMessage = {
  ...mockSingleWarningMessages,
  trajectoryType: TRAJECTORY_TYPE.LOAD,
  onClickItem: null,
  studyId: 123,
};
