import { DbTrajectory } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export const mockDbTrajectory: DbTrajectory = {
  id: 1,
  trajectoryName: 'area_BP_23_v6',
  type: TRAJECTORY_TYPE.AREA,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
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

export const mockResponseTrajectoryListFS = [
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
