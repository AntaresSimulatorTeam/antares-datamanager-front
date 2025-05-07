import { HypothesisRowData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

export const defaultAreaNotInAreaTrajectoryList = ['FR', 'DEkf'];

export const rowData: HypothesisRowData[] = [
  {
    hypothesis: 'FR',
    trajectory: {
      id: 1,
      trajectoryName: 'LOAD_area_BP_23',
      type: TRAJECTORY_TYPE.LOAD,
      version: 0,
      userName: 'unknown',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: [],
      loadArea: 'FR',
    },
    status: TRAJECTORY_SELECTION_STATUS.OK,
    isDefault: true,
  },
  {
    hypothesis: 'CH',
    trajectory: {
      id: 1,
      trajectoryName: '',
      type: TRAJECTORY_TYPE.LOAD,
      version: 0,
      userName: 'unknown',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: [],
      loadArea: 'CH',
    },
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    isDefault: true,
  },
  {
    hypothesis: 'DEkf',
    trajectory: {
      id: 1,
      trajectoryName: 'LOAD_area_BP_23',
      type: TRAJECTORY_TYPE.LOAD,
      version: 0,
      userName: 'unknown',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: [],
      loadArea: 'DEkf',
    },
    status: TRAJECTORY_SELECTION_STATUS.OK,
    isDefault: true,
  },
  {
    hypothesis: 'AT',
    trajectory: {
      id: 1,
      trajectoryName: 'LOAD_area_BP_23',
      type: TRAJECTORY_TYPE.LOAD,
      version: 0,
      userName: 'unknown',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: [],
      loadArea: 'AT',
    },
    status: TRAJECTORY_SELECTION_STATUS.OK,
    isDefault: true,
  },
];

export const rowDataTwo: HypothesisRowData[] = [
  {
    hypothesis: 'DKke',
    trajectory: {
      id: 1,
      trajectoryName: 'LOAD_area_BP_23',
      type: TRAJECTORY_TYPE.LOAD,
      version: 0,
      userName: 'unknown',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: [],
      loadArea: 'FR',
    },
    status: TRAJECTORY_SELECTION_STATUS.OK,
    isDefault: true,
  },
  {
    hypothesis: 'CH',
    trajectory: {
      id: 1,
      trajectoryName: '',
      type: TRAJECTORY_TYPE.LOAD,
      version: 0,
      userName: 'unknown',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: [],
      loadArea: 'CH',
    },
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
    isDefault: true,
  },
  {
    hypothesis: 'AT',
    trajectory: {
      id: 1,
      trajectoryName: 'LOAD_area_BP_23',
      type: TRAJECTORY_TYPE.LOAD,
      version: 0,
      userName: 'unknown',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: [],
      loadArea: 'AT',
    },
    status: TRAJECTORY_SELECTION_STATUS.OK,
    isDefault: true,
  },
];
