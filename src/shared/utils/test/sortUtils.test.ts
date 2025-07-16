import { sortKeepLastName, sortWithFixedPosition } from '@/shared/utils/sortUtils.ts';
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
        hypothesis: 'Dkkef',
        trajectory: {
          id: 1,
          trajectoryName: '',
          type: TRAJECTORY_TYPE.LOAD,
          version: 0,
          userName: 'unknown',
          creationDate: '2023-06-12 09:08:45' as unknown as Date,
          messages: [],
          loadArea: 'Dkkef',
        },
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: true,
        subRows: null,
      },
      {
        hypothesis: 'SL',
        trajectory: {
          id: 1,
          trajectoryName: 'LOAD_BP_23',
          type: TRAJECTORY_TYPE.LOAD,
          version: 0,
          userName: 'unknown',
          creationDate: '2026-08-34 18:45:89' as unknown as Date,
          messages: [],
          loadArea: 'SL',
        },
        status: TRAJECTORY_SELECTION_STATUS.OK,
        isDefault: true,
        subRows: null,
      },
      {
        hypothesis: 'GH',
        trajectory: {
          id: 1,
          trajectoryName: 'cnb_study_38',
          type: TRAJECTORY_TYPE.LOAD,
          version: 0,
          userName: 'unknown',
          creationDate: '2023-05-18 15:13:56' as unknown as Date,
          messages: [],
          loadArea: 'GH',
        },
        status: TRAJECTORY_SELECTION_STATUS.OK,
        isDefault: false,
        subRows: null,
      },
      {
        hypothesis: 'TR',
        trajectory: {
          id: 1,
          trajectoryName: 'Link_areas_BP_70',
          type: TRAJECTORY_TYPE.LOAD,
          version: 0,
          userName: 'comes',
          creationDate: '2024-09-21 15:13:63' as unknown as Date,
          messages: [],
          loadArea: 'TR',
        },
        status: TRAJECTORY_SELECTION_STATUS.OK,
        isDefault: false,
        subRows: null,
      },

      {
        hypothesis: OTHER_AREAS_LABEL,
        trajectory: {
          id: 1,
          trajectoryName: 'LOAD_other_BP_50',
          type: TRAJECTORY_TYPE.LOAD,
          version: 0,
          userName: 'robert',
          creationDate: '2025-08-34 10:40:30' as unknown as Date,
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
