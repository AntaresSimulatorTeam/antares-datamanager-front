import { DbTrajectory, FsTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

export const mockDataBaseTrajectory = (type: TRAJECTORY_TYPE, id: number, area: string): DbTrajectory => ({
  id,
  type,
  trajectoryName: `${type}-name`,
  version: 1,
  userName: 'CB',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  area,
  technology: '',
  hasTimeSeries: false,
});

export const mockDbTrajectory: DbTrajectory = {
  id: 1,
  trajectoryName: 'area_BP_23_v6',
  type: TRAJECTORY_TYPE.AREA,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  area: 'AT',
  technology: '',
  hasTimeSeries: false,
};

export const mockTrajectoryTwo: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockDbTrajectoryAREA: DbTrajectory = {
  id: 1,
  trajectoryName: 'area_BP_23_v6',
  type: TRAJECTORY_TYPE.AREA,
  version: 6,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  area: 'AT',
  technology: '',
  hasTimeSeries: false,
};

export const mockPrevStateArea = () => ({
  studyStatus: StudyStatus.IN_PROGRESS,
  [TRAJECTORY_TYPE.AREA]: {
    trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA')],
    warningMessages: [],
  },
});

export const mockPrevStateLoad = () => ({
  studyStatus: StudyStatus.IN_PROGRESS,
  [TRAJECTORY_TYPE.LOAD]: {
    trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA')],
    warningMessages: [],
  },
});

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

export const mockDbTrajectoryArray: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockDbTrajectoryArrayLoad: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.LOAD,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.LOAD,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 6,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.LOAD,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'FR',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockDbTrajectoryArrayThermal: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.THERMAL_CAPACITY,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.THERMAL_CAPACITY,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockDbTrajectoryArrayResDistribution: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.RES_ZONAL_DISTRIBUTION,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.RES_TECHNOLOGY_DISTRIBUTION,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockDbTrajectoryArrayResLoad: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.RES_CAPACITY,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.RES_CAPACITY,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockDbTrajectoryArrayResCapacity: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.RES_CAPACITY,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.RES_CAPACITY,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockEmptyDbTrajectoryArrayLoadSTS: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: '',
    type: TRAJECTORY_TYPE.STS,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: '',
    type: TRAJECTORY_TYPE.STS,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockEmptyDbTrajectoryArrayDSR: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: '',
    type: TRAJECTORY_TYPE.DSR,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: '',
    type: TRAJECTORY_TYPE.DSR,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockDefaultEmptyDbTrajectoryArrayDSR: DbTrajectory = {
  id: 1,
  trajectoryName: '',
  type: TRAJECTORY_TYPE.DSR,
  version: 3,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  area: 'OTHERS',
  technology: '',
  hasTimeSeries: false,
};

export const mockEmptyDbTrajectoryArrayLoad: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: '',
    type: TRAJECTORY_TYPE.LOAD,
    version: 0,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'ES',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: '',
    type: TRAJECTORY_TYPE.LOAD,
    version: 0,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'DEkf',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockDbTrajectoryArrayWithDuplicate: DbTrajectory[] = [
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 2,
    trajectoryName: 'area_PB_2026',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2026-08-22 15:13:56.860045' as unknown as Date,
    area: 'BE',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
  {
    id: 1,
    trajectoryName: 'area_PB_2024',
    type: TRAJECTORY_TYPE.AREA,
    version: 3,
    userName: 'mouad',
    creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
    area: 'AT',
    technology: '',
    hasTimeSeries: false,
  },
];

export const mockFsTrajectoryAreaArray: FsTrajectory[] = [
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

export const mockFsTrajectoryLoadArray: FsTrajectory[] = [
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

export const mockFsTrajectorySTSArray: FsTrajectory[] = [
  {
    trajectoryName: 'FR_BP23_A-ref_FR',
    type: TRAJECTORY_TYPE.STS,
    lastModifiedDate: '2025-07-02T11:57:48.493018687' as unknown as Date,
  },
  {
    trajectoryName: 'FR_BP23_A-ref_FR_nuc',
    type: TRAJECTORY_TYPE.STS,
    lastModifiedDate: '2025-07-02T11:57:48.493018687' as unknown as Date,
  },
  {
    trajectoryName: 'FR_DSR',
    type: TRAJECTORY_TYPE.STS,
    lastModifiedDate: '2025-06-27T10:40:47.410233' as unknown as Date,
  },
  {
    trajectoryName: 'BE_PEMMDB23_26avril',
    type: TRAJECTORY_TYPE.STS,
    lastModifiedDate: '2025-06-27T10:40:07.150247' as unknown as Date,
  },
];

export const mockFsTrajectoryParaModulationArray: FsTrajectory[] = [
  {
    trajectoryName: 'params',
    type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
    lastModifiedDate: '2025-07-02T11:57:48.493018687' as unknown as Date,
  },
  {
    trajectoryName: 'params_2',
    type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
    lastModifiedDate: '2025-07-02T11:57:48.493018687' as unknown as Date,
  },
  {
    trajectoryName: 'params_PEMMDB',
    type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
    lastModifiedDate: '2025-06-27T10:40:47.410233' as unknown as Date,
  },
];

export const mockTrajectoryAreaData: TrajectoryAreaData[] = [
  {
    areaName: 'CH',
    spilledEnergyCost: '2.356',
    unsuppliedEnergyCost: '15.5',
  },
  {
    areaName: 'BR',
    spilledEnergyCost: '2.356',
    unsuppliedEnergyCost: '32.5',
  },
  {
    areaName: 'ES',
    spilledEnergyCost: '2.356',
    unsuppliedEnergyCost: '32.5',
  },
  {
    areaName: 'IE',
    spilledEnergyCost: '2.356',
    unsuppliedEnergyCost: '32.5',
  },
  {
    areaName: 'ITcs',
    spilledEnergyCost: '2.356',
    unsuppliedEnergyCost: '32.5',
  },
];

export const mockDefaultArea = [{ name: 'FR' }];

export const mockEmptyDbTrajectoryLoadOthers: DbTrajectory = {
  id: 1,
  trajectoryName: '',
  type: TRAJECTORY_TYPE.LOAD,
  version: 0,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  area: 'OTHERS',
  technology: '',
  hasTimeSeries: false,
};

export const mockEmptyDbTrajectoryLoadFR: DbTrajectory = {
  id: 1,
  trajectoryName: '',
  type: TRAJECTORY_TYPE.LOAD,
  version: 0,
  userName: 'mouad',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  area: 'FR',
  technology: '',
  hasTimeSeries: false,
};
