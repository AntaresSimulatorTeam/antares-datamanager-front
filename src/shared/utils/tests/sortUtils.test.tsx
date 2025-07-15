import { sortKeepLastName, sortWithFixedPosition } from '@/shared/utils/sortUtils.tsx';
import { rowData, rowDataTwo } from '@/mocks/data/tests/hypothesisTable.mock.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

describe('sortKeepLastName', () => {
  it('should return an array sorted alphabetically expect for name passed as argument', () => {
    expect(sortKeepLastName(rowData, 'DEkf')).toEqual([
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
        subRows: null,
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
        subRows: null,
      },
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
        subRows: null,
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
        subRows: null,
      },
    ]);
  });
  it('should return an empty array when empty as an argument', () => {
    expect(sortKeepLastName([], 'AT')).toEqual([]);
  });
});

describe('sortKeepLastName', () => {
  it('should return an array sorted alphabetically expect for name passed as argument', () => {
    expect(sortWithFixedPosition(rowDataTwo)).toEqual([
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
        subRows: null,
      },
      {
        hypothesis: 'SL',
        trajectory: {
          id: 1,
          trajectoryName: 'LOAD_area_BP_23',
          type: TRAJECTORY_TYPE.LOAD,
          version: 0,
          userName: 'unknown',
          creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
          messages: [],
          loadArea: 'SL',
        },
        status: TRAJECTORY_SELECTION_STATUS.OK,
        isDefault: true,
        subRows: null,
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
        isDefault: false,
        subRows: null,
      },
      {
        hypothesis: 'BE',
        trajectory: {
          id: 1,
          trajectoryName: 'LOAD_area_BP_23',
          type: TRAJECTORY_TYPE.LOAD,
          version: 0,
          userName: 'unknown',
          creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
          messages: [],
          loadArea: 'BE',
        },
        status: TRAJECTORY_SELECTION_STATUS.OK,
        isDefault: false,
        subRows: null,
      },

      {
        hypothesis: OTHER_AREAS_LABEL,
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
        subRows: null,
      },
    ]);
  });
  it('should return an empty array when empty as an argument', () => {
    expect(sortKeepLastName([], 'AT')).toEqual([]);
  });
});
