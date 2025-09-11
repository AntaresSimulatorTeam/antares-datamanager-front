import {
  addNestedRow,
  buildDefaultEmptyTrajectoryList,
  buildEmptyTrajectory,
  buildErrorTrajectory,
  buildReadOnlyRow,
  buildRowData,
  buildRowWithSubRowsData,
  getAreaTrajectoryName,
  getBgColor,
  getChildrenList,
  getDefaultLabel,
  getHypothesis,
  getPathFromTrajectoryType,
  getQueryParamAreaValue,
  getRowDataSelected,
  getStatus,
  getStudyMenu,
  getTrajectoryTypeByIndex,
  isMatchingTrajectoryType,
  isTrajectoryLinked,
  removeDuplicate,
  retrieveReadOnlyArea,
  setNestedData,
} from '../trajectoryUtils';
import { defaultAreaNotInAreaTrajectoryList, rowData, rowDataTwo } from '@/mocks/data/tests/hypothesisTable.mock.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { afterEach, beforeEach, vi } from 'vitest';
import {
  mockDbTrajectory,
  mockDbTrajectoryAREA,
  mockDbTrajectoryArrayWithDuplicate,
  mockRowDataTrajectoryA,
  mockRowDataTrajectoryB,
  mockRowDataTrajectoryC,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { DbTrajectory, HypothesisRowData, HypothesisTab } from '@/shared/types';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { Row } from '@tanstack/react-table';

describe('getStatus', () => {
  it("should return an ERROR selection status for 'error' status", () => {
    const status = getStatus('error');
    expect(status).toStrictEqual(TRAJECTORY_SELECTION_STATUS.ERROR);
  });
  it("should return a OK selection status for 'success' status", () => {
    const status = getStatus('success');
    expect(status).toStrictEqual(TRAJECTORY_SELECTION_STATUS.OK);
  });
  it("should return a WARNING selection status for  'warning' status", () => {
    const status = getStatus('warning');
    expect(status).toStrictEqual(TRAJECTORY_SELECTION_STATUS.WARNING);
  });
  it("should return a MISSING selection status for 'empty' status", () => {
    const status = getStatus('empty');
    expect(status).toStrictEqual(TRAJECTORY_SELECTION_STATUS.MISSING);
  });
  it('should return a MISSING selection status when no status', () => {
    const status = getStatus();
    expect(status).toStrictEqual(TRAJECTORY_SELECTION_STATUS.MISSING);
  });
});

describe('getBgColor', () => {
  it("should return the right color for 'loading' status", () => {
    const color = getBgColor('loading');
    expect(color).toStrictEqual('bg-acc1-600');
  });
  it("should return the right color for 'success' status", () => {
    const color = getBgColor('success');
    expect(color).toStrictEqual('bg-success-600');
  });
  it("should return the right color for 'error' status", () => {
    const color = getBgColor('error');
    expect(color).toStrictEqual('bg-error-600');
  });
  it("should return the right color for 'empty' status", () => {
    const color = getBgColor('empty');
    expect(color).toStrictEqual('bg-gray-600');
  });
  it('should return the right color when no status', () => {
    const color = getBgColor();
    expect(color).toStrictEqual('bg-gray-600');
  });
});

describe('buildErrorTrajectory', () => {
  beforeEach(() => {
    Math.random = vi.fn(() => 1);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return an error trajectory', () => {
    const date = new Date(2000, 1, 1, 13);
    vi.setSystemTime(date);
    const errorTrajectory = buildErrorTrajectory(TRAJECTORY_TYPE.AREA, 3, 'trajectory', null, 'FR');
    expect(errorTrajectory).toStrictEqual({
      id: 3,
      trajectoryName: 'trajectory',
      technology: '',
      type: TRAJECTORY_TYPE.AREA,
      version: 0,
      userName: 'unknown_user',
      creationDate: date,
      area: 'FR',
      state: TRAJECTORY_SELECTION_STATUS.ERROR,
    });
  });
});

describe('removeDuplicate', () => {
  it('should remove duplicated trajectories from array', () => {
    const result = removeDuplicate(mockDbTrajectoryArrayWithDuplicate);
    expect(result).toStrictEqual([
      {
        id: 1,
        trajectoryName: 'area_PB_2024',
        type: TRAJECTORY_TYPE.AREA,
        version: 3,
        userName: 'mouad',
        creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
        area: 'AT',
        technology: '',
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
      },
    ]);
  });
  it('should remove duplicated trajectories from array', () => {
    const result = removeDuplicate([]);
    expect(result).toStrictEqual([]);
  });
});

describe('buildRowData', () => {
  it("should return an 'other' row data with OK status", () => {
    const rowDataOther = buildRowData(OTHER_AREAS, true, mockDbTrajectory);
    expect(rowDataOther).toStrictEqual({
      hypothesis: OTHER_AREAS_LABEL,
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      isDefault: true,
    });
  });
  it("should return an 'other' row data with MISSING status", () => {
    const rowDataOther = buildRowData(OTHER_AREAS, true);
    expect(rowDataOther).toStrictEqual({
      hypothesis: OTHER_AREAS_LABEL,
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: true,
    });
  });
  it('should return a row data with OK status', () => {
    const rowDataOk = buildRowData('FR', false, mockDbTrajectory);
    expect(rowDataOk).toStrictEqual({
      hypothesis: 'FR',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      isDefault: false,
    });
  });
});

describe('buildEmptyTrajectory', () => {
  it('should generate a trajectory with expected default fields', () => {
    const area = 'ZoneX';
    const type: TRAJECTORY_TYPE = TRAJECTORY_TYPE.AREA;

    const result: DbTrajectory = buildEmptyTrajectory(area, type);

    expect(result.area).toBe(area);
    expect(result.type).toBe(type);
    expect(result.trajectoryName).toBe('');
    expect(result.version).toBe(0);
    expect(result.userName).toBe('user');
    expect(result.state).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(result.creationDate).toBeInstanceOf(Date);
  });
});

describe('buildRowWithSubRowsData', () => {
  const subRowOptions = ['Option A', 'Option B'];

  it('returns correct data when loadArea is OTHER_AREAS', () => {
    const trajectory = { area: OTHER_AREAS, technology: '', trajectoryName: 'name' } as DbTrajectory;

    const result = buildRowWithSubRowsData(trajectory, [], [], subRowOptions);

    expect(result).toEqual({
      hypothesis: OTHER_AREAS_LABEL,
      trajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      isDefault: true,
      subRows: null,
    });
  });

  it('returns correct data when trajectory has name and is in defaultAreas', () => {
    const trajectory = { area: 'Zone 1', trajectoryName: 'T1', technology: '' } as DbTrajectory;
    const defaultAreas = [{ name: 'Zone 1' }];

    const result = buildRowWithSubRowsData(trajectory, defaultAreas, [], subRowOptions);

    expect(result).toEqual({
      hypothesis: 'Zone 1',
      trajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      isDefault: true,
      subRows: [
        {
          hypothesis: 'Option A',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          subRows: null,
        },
        {
          hypothesis: 'Option B',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          subRows: null,
        },
      ],
    });
  });

  it('returns correct data when trajectory has name and technology', () => {
    const trajectory = { area: 'Zone 1', trajectoryName: 'T1', technology: 'Option A' } as DbTrajectory;

    const result = buildRowWithSubRowsData(trajectory, [], [], subRowOptions);

    expect(result).toEqual({
      hypothesis: 'Zone 1',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      subRows: [
        {
          hypothesis: 'Option A',
          trajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: true,
          subRows: null,
        },
        {
          hypothesis: 'Option B',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          subRows: null,
        },
      ],
    });
  });

  it('excludes subRows if area is in areasNotInTrajectoryArea', () => {
    const trajectory = { area: 'Zone 2' } as DbTrajectory;
    const areasNotInTrajectoryArea = ['Zone 2'];

    const result = buildRowWithSubRowsData(trajectory, undefined, areasNotInTrajectoryArea, subRowOptions);

    expect(result.subRows).toBeNull();
  });

  it('marks isDefault as false if not in defaultAreas and not OTHER_AREAS', () => {
    const trajectory = { area: 'Zone 3' } as DbTrajectory;
    const defaultAreas = [{ name: 'Zone 1' }];

    const result = buildRowWithSubRowsData(trajectory, defaultAreas, [], subRowOptions);

    expect(result.isDefault).toBe(false);
  });
});

describe('isTrajectoryLinked', () => {
  it('should return true when a matching trajectory with empty technology exists', () => {
    const area = { name: 'ZoneA' };
    const trajectories: DbTrajectory[] = [
      { area: 'ZoneA', technology: '' } as DbTrajectory,
      { area: 'ZoneB', technology: 'TechY' } as DbTrajectory,
    ];

    expect(isTrajectoryLinked(area, trajectories)).toBe(true);
  });

  it('should return false when no matching trajectory with empty technology exists', () => {
    const area = { name: 'ZoneA' };
    const trajectories: DbTrajectory[] = [
      { area: 'ZoneA', technology: 'TechX' } as DbTrajectory,
      { area: 'ZoneB', technology: '' } as DbTrajectory,
    ];

    expect(isTrajectoryLinked(area, trajectories)).toBe(false);
  });

  it('should return false when trajectories list is empty', () => {
    const area = { name: 'ZoneA' };
    const trajectories: DbTrajectory[] = [];

    expect(isTrajectoryLinked(area, trajectories)).toBe(false);
  });
});

describe('buildDefaultEmptyTrajectoryList', () => {
  it('should return default areas when trajectories are empty', () => {
    const type = TRAJECTORY_TYPE.LOAD;
    const trajectories: DbTrajectory[] = [];
    const defaultAreas = [{ name: 'ZoneA' }, { name: 'ZoneB' }];

    const result = buildDefaultEmptyTrajectoryList(type, trajectories, defaultAreas);

    expect(result[0].area).toEqual(OTHER_AREAS);
    expect(result[1].area).toEqual('ZoneA');
    expect(result[2].area).toEqual('ZoneB');
  });

  it('should exclude areas already linked to a trajectory with empty technology', () => {
    const type = TRAJECTORY_TYPE.LOAD;
    const trajectories: DbTrajectory[] = [{ area: 'ZoneA', technology: '', type } as DbTrajectory];
    const defaultAreas = [{ name: 'ZoneA' }, { name: 'ZoneB' }];

    const result = buildDefaultEmptyTrajectoryList(type, trajectories, defaultAreas);

    expect(result[0].area).toEqual(OTHER_AREAS);
    expect(result[1].area).toEqual('ZoneB');
  });

  it('should return only OTHER_AREAS when no defaultAreas are provided and trajectories are empty', () => {
    const type = TRAJECTORY_TYPE.LOAD;
    const trajectories: DbTrajectory[] = [];

    const result = buildDefaultEmptyTrajectoryList(type, trajectories);

    expect(result[0].area).toEqual(OTHER_AREAS);
  });

  it('should return empty list if all default areas are already linked', () => {
    const type = TRAJECTORY_TYPE.LOAD;
    const trajectories: DbTrajectory[] = [
      { area: OTHER_AREAS, technology: '', type } as DbTrajectory,
      { area: 'ZoneA', technology: '', type } as DbTrajectory,
    ];
    const defaultAreas = [{ name: 'ZoneA' }];

    const result = buildDefaultEmptyTrajectoryList(type, trajectories, defaultAreas);

    expect(result).toEqual([]);
  });
});

describe('buildReadOnlyRow', () => {
  it('should return an read only object type from indexes array', () => {
    const readOnlyRows = buildReadOnlyRow([1, 7, 10]);
    expect(readOnlyRows).toStrictEqual({ '1': true, '7': true, '10': true });
  });

  it('should return an empty object when indexes array is provided', () => {
    const readOnlyRows = buildReadOnlyRow();
    expect(readOnlyRows).toStrictEqual({});
  });
});

describe('addNestedRow', () => {
  const baseRow: HypothesisRowData = mockRowDataTrajectoryA;
  const newRow: HypothesisRowData = mockRowDataTrajectoryB;

  it('should add a subRow to a parent with no existing subRows', () => {
    const data = [baseRow];
    const result = addNestedRow(data, newRow, 'A');

    expect(result[0].subRows).toEqual([mockRowDataTrajectoryB]);
  });

  it('should append and sort subRows alphabetically by hypothesis', () => {
    const data: HypothesisRowData[] = [
      {
        hypothesis: 'A',
        trajectory: mockDbTrajectory,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        subRows: [mockRowDataTrajectoryC],
      },
    ];
    const result = addNestedRow(data, mockRowDataTrajectoryB, 'A');

    expect(result[0].subRows).toEqual([mockRowDataTrajectoryB, mockRowDataTrajectoryC]);
  });

  it('should not modify rows if parentValue does not match', () => {
    const data = [baseRow];
    const result = addNestedRow(data, newRow, 'Z');

    expect(result).toEqual(data);
  });

  it('should handle undefined parentValue gracefully', () => {
    const data = [baseRow];
    const result = addNestedRow(data, newRow);

    expect(result).toEqual(data);
  });
});

describe('retrieveReadOnlyArea', () => {
  it('should return an object with the row index where a default area is not included in the areas option list', () => {
    const readOnlyRows = retrieveReadOnlyArea(rowData, defaultAreaNotInAreaTrajectoryList);
    expect(readOnlyRows).toStrictEqual({ '0': true, '2': true });
  });

  it('should return an empty object when there are not default areas', () => {
    const readOnlyRows = retrieveReadOnlyArea(rowData, []);
    expect(readOnlyRows).toStrictEqual({});
  });

  it('should return an empty object when all default areas are included in the areas option list', () => {
    const readOnlyRows = retrieveReadOnlyArea(rowDataTwo, defaultAreaNotInAreaTrajectoryList);
    expect(readOnlyRows).toStrictEqual({});
  });
});

describe('getStudyMenu', () => {
  const mockTranslate = (value: string) => `translated:${value}`;

  it('should return correct tab structure when area is not linked', () => {
    const result: HypothesisTab[] = getStudyMenu(mockTranslate, false);

    expect(result.length).toBe(5);

    expect(result[0]).toEqual({
      name: TRAJECTORY_TYPE.AREA,
      label: 'translated:studyDetails.@areas_links',
      icon: StdIconId.LinkedServices,
      isDisabled: false,
    });

    expect(result[1].isDisabled).toBe(false);
    expect(result[2].isDisabled).toBe(false);
    expect(result[3].isDisabled).toBe(true);
    expect(result[4].isDisabled).toBe(true);
  });

  it('should disable LOAD and THERMAL_CAPACITY when area is linked', () => {
    const result = getStudyMenu(mockTranslate, true);

    expect(result[1].name).toBe(TRAJECTORY_TYPE.LOAD);
    expect(result[1].isDisabled).toBe(true);

    expect(result[2].name).toBe(TRAJECTORY_TYPE.THERMAL_CAPACITY);
    expect(result[2].isDisabled).toBe(true);
  });

  it('should apply translation function to labels', () => {
    const result = getStudyMenu(mockTranslate, false);

    for (const tab of result) {
      expect(tab.label.startsWith('translated:')).toBe(true);
    }
  });
});

describe('isMatchingTrajectoryType', () => {
  it('should return true for matching trajectory types', () => {
    const matcher = isMatchingTrajectoryType(TRAJECTORY_TYPE.AREA);
    expect(matcher(TRAJECTORY_TYPE.AREA)).toBe(true);
  });

  it('should return false for non-matching trajectory types', () => {
    const matcher = isMatchingTrajectoryType(TRAJECTORY_TYPE.LOAD);
    expect(matcher(TRAJECTORY_TYPE.THERMAL_CAPACITY)).toBe(false);
  });
});

describe('getRowDataSelected', () => {
  const mockData: HypothesisRowData[] = [
    {
      hypothesis: 'row0',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [
        { hypothesis: 'row0-sub0', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
        { hypothesis: 'row0-sub1', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
      ],
    },
    {
      hypothesis: 'row1',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
    },
  ];

  it('should return subRow when indexArray has length 2', () => {
    const result = getRowDataSelected(mockData, [0, 1]);
    expect(result?.hypothesis).toBe('row0-sub1');
  });

  it('should return top-level row when indexArray has length 1', () => {
    const result = getRowDataSelected(mockData, [1]);
    expect(result?.hypothesis).toBe('row1');
  });

  it('should return null if subRows is undefined', () => {
    const result = getRowDataSelected(mockData, [1, 0]);
    expect(result).toBeNull();
  });

  it('should return null if indexArray is empty', () => {
    const result = getRowDataSelected(mockData, []);
    expect(result).toBeNull();
  });

  it('should return null if indexArray points to out-of-bound index', () => {
    const result = getRowDataSelected(mockData, [5]);
    expect(result).toBeNull();
  });
});

describe('getHypothesis', () => {
  const mockData: HypothesisRowData[] = [
    {
      hypothesis: 'AI',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [
        { hypothesis: 'Machine Learning', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
        { hypothesis: 'Deep Learning', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
      ],
    },
    {
      hypothesis: OTHER_AREAS_LABEL,
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
    },
  ];

  it('should return parent and sub hypothesis for rowId with two levels', () => {
    const result = getHypothesis(mockData, '0.1');
    expect(result).toEqual({
      hypothesis: 'AI',
      technology: 'Deep Learning',
    });
  });

  it('should return hypothesis and undefined technology for rowId with one level', () => {
    const result = getHypothesis(mockData, '0');
    expect(result).toEqual({
      hypothesis: 'AI',
      technology: undefined,
    });
  });

  it('should return OTHER_AREAS when hypothesis is OTHER_AREAS_LABEL', () => {
    const result = getHypothesis(mockData, '1');
    expect(result).toEqual({
      hypothesis: OTHER_AREAS,
      technology: undefined,
    });
  });

  it('should return undefined values for invalid rowId', () => {
    const result = getHypothesis(mockData, '5');
    expect(result).toEqual({
      hypothesis: undefined,
      technology: undefined,
    });
  });
});

describe('setNestedData', () => {
  const initialState: HypothesisRowData[] = [
    {
      hypothesis: 'ES',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [
        { hypothesis: 'CCGT', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
        { hypothesis: 'DSR', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
      ],
    },
    {
      hypothesis: 'CZ',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
    },
  ];

  const newData = { trajectory: mockDbTrajectoryAREA, status: TRAJECTORY_SELECTION_STATUS.OK } as Pick<
    HypothesisRowData,
    'trajectory' | 'status'
  >;

  it('should update top-level row', () => {
    const result = setNestedData(initialState, [1], newData);
    expect(result[1].trajectory).toStrictEqual(mockDbTrajectoryAREA);
    expect(result[1].status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
  });

  it('should update nested subRow', () => {
    const result = setNestedData(initialState, [0, 1], newData);
    expect(result[0].subRows?.[1].trajectory).toStrictEqual(mockDbTrajectoryAREA);
    expect(result[0].subRows?.[1].status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
  });

  it('should not modify other rows', () => {
    const result = setNestedData(initialState, [0, 1], newData);
    expect(result[1]).toEqual(initialState[1]);
    expect(result[0].subRows?.[0]).toEqual(initialState[0].subRows?.[0]);
  });
});

describe('getChildrenList', () => {
  it('should return technologies when depth is 0 and subRows have technologies', () => {
    const row = {
      depth: 0,
      originalSubRows: [{ trajectory: { technology: 'AI' } }, { trajectory: { technology: 'Blockchain' } }],
    } as Row<HypothesisRowData>;

    const result = getChildrenList(row);
    expect(result).toEqual(['AI', 'Blockchain']);
  });

  it('should return empty array when depth is not 0', () => {
    const row = {
      depth: 1,
      originalSubRows: [{ trajectory: { technology: 'AI' } }],
    } as Row<HypothesisRowData>;

    const result = getChildrenList(row);
    expect(result).toEqual([]);
  });

  it('should skip subRows without technology', () => {
    const row = {
      depth: 0,
      originalSubRows: [{ trajectory: { technology: '' } }, { trajectory: {} }, {}],
    } as Row<HypothesisRowData>;

    const result = getChildrenList(row);
    expect(result).toEqual([]);
  });

  it('should handle undefined originalSubRows', () => {
    const row = {
      depth: 0,
    } as Row<HypothesisRowData>;

    const result = getChildrenList(row);
    expect(result).toEqual([]);
  });
});

describe('getAreaTrajectoryName', () => {
  const mockData = [
    {
      hypothesis: 'Energy',
      subRows: [{ hypothesis: 'Solar' } as HypothesisRowData, { hypothesis: 'Wind' } as HypothesisRowData],
    },
    {
      hypothesis: 'Transport',
      subRows: [{ hypothesis: 'Electric' } as HypothesisRowData],
    },
  ] as HypothesisRowData[];

  it('should return combined hypothesis for valid rowIdSelected', () => {
    expect(getAreaTrajectoryName('0.1', mockData)).toBe('Energy - Wind');
    expect(getAreaTrajectoryName('1.0', mockData)).toBe('Transport - Electric');
  });

  it('should return only main hypothesis if subRow hypothesis is missing', () => {
    const dataWithMissingSubHypothesis = [
      {
        hypothesis: 'Agriculture',
        subRows: [{}],
      },
    ] as HypothesisRowData[];
    expect(getAreaTrajectoryName('0.0', dataWithMissingSubHypothesis)).toBe('Agriculture');
  });

  it('should return empty string if mainRow is missing', () => {
    expect(getAreaTrajectoryName('5.0', mockData)).toBe('');
  });

  it('should return empty string if both hypotheses are missing', () => {
    const emptyData: HypothesisRowData[] = [{}, {}] as HypothesisRowData[];
    expect(getAreaTrajectoryName('0.0', emptyData)).toBe('');
  });
});

describe('getTrajectoryTypeByIndex', () => {
  it('should return SPECIFIC for index 0', () => {
    expect(getTrajectoryTypeByIndex(0)).toBe(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER);
  });

  it('should return COMMON for index 1', () => {
    expect(getTrajectoryTypeByIndex(1)).toBe(TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER);
  });

  it('should return MODULATION for index 2', () => {
    expect(getTrajectoryTypeByIndex(2)).toBe(TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER);
  });

  it('should return SPECIFIC for any other index', () => {
    expect(getTrajectoryTypeByIndex(99)).toBe(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER);
    expect(getTrajectoryTypeByIndex(-1)).toBe(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER);
  });
});

describe('getPathFromTrajectoryType', () => {
  it('should return economic path for THERMAL_ECONOMIC_PARAMETER', () => {
    expect(getPathFromTrajectoryType(TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER)).toBe(
      '\\\\thermal\\economic parameters\\economic',
    );
  });

  it('should return cost path for THERMAL_ECONOMIC_COST_PARAMETER', () => {
    expect(getPathFromTrajectoryType(TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER)).toBe(
      '\\\\thermal\\economic parameters\\costs',
    );
  });

  it('should return modulation path for THERMAL_TECHNICAL_MODULATION_PARAMETER', () => {
    expect(getPathFromTrajectoryType(TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER)).toBe(
      '\\\\thermal\\technical parameters\\param_modulation',
    );
  });

  it('should return technical path for THERMAL_TECHNICAL_SPECIFIC_PARAMETER', () => {
    expect(getPathFromTrajectoryType(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER)).toBe(
      '\\\\thermal\\technical parameters',
    );
  });

  it('should return technical path for THERMAL_TECHNICAL_COMMON_PARAMETER', () => {
    expect(getPathFromTrajectoryType(TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER)).toBe(
      '\\\\thermal\\technical parameters',
    );
  });

  it('should return technical path for unknown type', () => {
    expect(getPathFromTrajectoryType('UNKNOWN_TYPE' as TRAJECTORY_TYPE)).toBeNull();
  });
});

describe('getDefaultLabel', () => {
  it('should append defaultLabel when isDefault is true and name is not OTHER_AREAS', () => {
    const result = getDefaultLabel('Zone A');
    expect(result).toBe('Zone A');
  });

  it('should return name when name is OTHER_AREAS even if isDefault is true', () => {
    const result = getDefaultLabel(OTHER_AREAS);
    expect(result).toBe(OTHER_AREAS_LABEL);
  });
});

describe('getQueryParamAreaValue', () => {
  it('should return OTHER_AREAS when hypothesis equals OTHER_AREAS_LABEL', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.LOAD, OTHER_AREAS_LABEL);
    expect(result).toBe(OTHER_AREAS);
  });

  it('should remove defaultLabel from hypothesis if type is not THERMAL_CAPACITY', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.LOAD, 'Paris');
    expect(result).toBe('Paris');
  });

  it('should handle undefined hypothesis gracefully', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.LOAD, undefined as unknown as string);
    expect(result).toBe('');
  });
});
