import { DbTrajectory, TrajectoryAreaData, WarningMessage } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';

export const mockDbTrajectory: DbTrajectory = {
  id: 1,
  trajectoryName: 'area_BP_23_v6',
  type: TRAJECTORY_TYPE.AREA,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  messages: [],
  loadArea: 'AT',
};

export const mockDbTrajectoryArray = [
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

export const mockWarningMessagesWithTwo: WarningMessage[] = [
  {
    id: 1,
    content:
      'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
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
    trajectory: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
];

export const mockTrajectoryWithWarnings = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    loadArea: 'AT',
    messages: mockWarningMessagesWithTwo,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    loadArea: 'BE',
    messages: mockWarningMessagesWithTwo,
  },
];

export const mockFsTrajectoryArray = [
  {
    trajectoryName: 'area_BP_2028',
    type: TRAJECTORY_TYPE.AREA,
    lastModifiedDate: '2026-08-22 15:13:56.860045' as unknown as Date,
  },
  {
    trajectoryName: 'area_BP_2027',
    type: TRAJECTORY_TYPE.AREA,
    lastModifiedDate: '2026-08-22 15:13:56.860045' as unknown as Date,
  },
  {
    trajectoryName: 'area_BP_2030_2050',
    type: TRAJECTORY_TYPE.AREA,
    lastModifiedDate: '2026-08-22 15:13:56.860045' as unknown as Date,
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
    trajectory: 'areas_BP23_A_ref',
    secondTrajectory: 'links_BP23_A_ref',
    isAck: false,
  },
];

export const mockTrajectoryAreaData: TrajectoryAreaData[] = [
  {
    areaName: 'CH',
    powerToGas: 'false',
    shortTermStorage: 'false',
  },
  {
    areaName: 'BR',
    powerToGas: 'false',
    shortTermStorage: 'false',
  },
  {
    areaName: 'ES',
    powerToGas: 'true',
    shortTermStorage: 'false',
  },
  {
    areaName: 'IE',
    powerToGas: 'false',
    shortTermStorage: 'true',
  },
  {
    areaName: 'ITcs',
    powerToGas: 'false',
    shortTermStorage: 'false',
  },
];

export const mockDefaultArea = [{ name: 'FR' }];
