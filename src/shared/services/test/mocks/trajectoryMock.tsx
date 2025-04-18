import { DbTrajectory, WarningMessage } from '@/shared/types';
import { TRAJECTORY_TYPE, WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';

export const mockDbTrajectory: DbTrajectory = {
  id: 1,
  trajectoryName: 'area_BP_23_v6',
  type: TRAJECTORY_TYPE.AREA,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  messages: [],
};

export const mockDbTrajectoryArray = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
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
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 2,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 3,
    content: 'this is an error message',
    level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 4,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 5,
    content:
      'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 6,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 7,
    content: 'this is an error message',
    level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 8,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
];
