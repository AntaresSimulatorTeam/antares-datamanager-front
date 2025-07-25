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
  trajectory: 'areas_BP23_A_ref',
  secondTrajectory: 'links_BP23_A_ref',
  isAck: false,
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
    trajectory: 'areas_BP23_A_ref',
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
    trajectory: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
];

export const mockTrajectoryTwo = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    loadArea: 'AT',
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    loadArea: 'BE',
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
    trajectory: 'areas_BP23_A_ref',
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
    trajectory: 'areas_BP23_A_ref',
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
    trajectory: 'areas_BP23_A_ref',
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
    trajectory: 'areas_BP23_A_ref',
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
    trajectory: 'areas_BP23_A_ref',
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
    trajectory: 'areas_BP23_A_ref',
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
    trajectory: 'areas_BP23_A_ref',
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
    trajectory: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
];

export const mockDataMessage: DataWarningMessage = {
  ...mockSingleWarningMessages,
  trajectory: 'load_BP_23_REF',
  trajectoryType: TRAJECTORY_TYPE.LOAD,
  onClickItem: null,
};
