import { DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export const mockDbTrajectory: DbTrajectory = {
  id: 1,
  trajectoryName: 'area_BP_23_v6',
  type: TRAJECTORY_TYPE.AREA,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  loadArea: 'AT',
};

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

export const mockDbTrajectoryAREA: DbTrajectory = {
  id: 1,
  trajectoryName: 'area_BP_23_v6',
  type: TRAJECTORY_TYPE.AREA,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  loadArea: 'AT',
};

export const mockDbTrajectoryLINK: DbTrajectory = {
  id: 1,
  trajectoryName: 'link_BP_23_v6',
  type: TRAJECTORY_TYPE.LINK,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  loadArea: 'AT',
};

export const mockRowDataTrajectoryA: HypothesisRowData = {
  hypothesis: 'A',
  trajectory: mockDbTrajectoryAREA,
  status: TRAJECTORY_SELECTION_STATUS.OK,
};

export const mockRowDataTrajectoryB: HypothesisRowData = {
  hypothesis: 'B',
  trajectory: mockDbTrajectoryAREA,
  status: TRAJECTORY_SELECTION_STATUS.MISSING,
};

export const mockRowDataTrajectoryC: HypothesisRowData = {
  hypothesis: 'C',
  trajectory: mockDbTrajectoryAREA,
  status: TRAJECTORY_SELECTION_STATUS.MISSING,
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

export const mockDbTrajectoryArrayWithDuplicate = [
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
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    loadArea: 'AT',
  },
];

export const mockFsTrajectoryAreaArray = [
  {
    trajectoryName: 'area_BP_2028.xlsx',
    type: TRAJECTORY_TYPE.AREA,
    lastModifiedDate: '2026-08-22 15:13:56.860045' as unknown as Date,
  },
  {
    trajectoryName: 'area_BP_2027.xlsx',
    type: TRAJECTORY_TYPE.AREA,
    lastModifiedDate: '2026-08-22 15:13:56.860045' as unknown as Date,
  },
  {
    trajectoryName: 'area_BP_2030_2050.xlsx',
    type: TRAJECTORY_TYPE.AREA,
    lastModifiedDate: '2026-08-22 15:13:56.860045' as unknown as Date,
  },
];

export const mockFsTrajectoryLoadArray = [
  {
    trajectoryName: 'BP23_TEST_LOAD',
    type: TRAJECTORY_TYPE.LOAD,
    lastModifiedDate: '2025-07-02T11:57:48.493018687' as unknown as Date,
  },
  {
    trajectoryName: 'BP23_LOAD_3332',
    type: TRAJECTORY_TYPE.LOAD,
    lastModifiedDate: '2025-07-02T11:57:48.493018687' as unknown as Date,
  },
  {
    trajectoryName: 'BP23_AREF_EU_coherence_scenario6',
    type: TRAJECTORY_TYPE.LOAD,
    lastModifiedDate: '2025-06-27T10:40:47.410233' as unknown as Date,
  },
  {
    trajectoryName: 'BP23_AREF_EU_CBN_VIDE',
    type: TRAJECTORY_TYPE.LOAD,
    lastModifiedDate: '2025-06-27T10:40:07.150247' as unknown as Date,
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
