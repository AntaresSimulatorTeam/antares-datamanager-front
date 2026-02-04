import {
  addNestedRow,
  buildDefaultEmptyTrajectoryList,
  buildEmptyRowWithSubRowsData,
  buildEmptyTrajectory,
  buildErrorTrajectory,
  buildReadOnlyRow,
  buildRowData,
  buildRowWithSubRowsData,
  convertIntoHypothesisRowWithTechnologies,
  filterRow,
  generateReadOnlyIndexMap,
  getAreaTrajectoryName,
  getBgColor,
  getDefaultLabel,
  getHypothesis,
  getPathFromTrajectoryType,
  getQueryParamAreaValue,
  getRowDataSelected,
  getStatus,
  getStudyMenu,
  getSubRowListWithArea,
  getSubRowsList,
  getTrajectoryTypeByIndex,
  isMatchingTrajectoryType,
  isTechnicalParametersType,
  isTrajectoryLinked,
  isUniqueTrajectoryType,
  removeDuplicate,
  retrieveReadOnlyArea,
  setNestedData,
  shouldDeleteParamModulation,
  shouldHaveSubRows,
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
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { TFunction } from 'i18next';

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
    expect(color).toStrictEqual('bg-primary-600');
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
      hasTimeSeries: false,
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

  it('returns correct data when area is OTHER_AREAS', () => {
    const trajectory = { area: OTHER_AREAS, technology: '', trajectoryName: 'name' } as DbTrajectory;

    const result = buildRowWithSubRowsData(trajectory, [], [], subRowOptions);

    expect(result).toEqual({
      hypothesis: OTHER_AREAS_LABEL,
      trajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      isDefault: true,
      isDeletable: false,
      subRows: null,
    });
  });

  it('returns correct data when area is undefined', () => {
    const trajectory = { technology: '', trajectoryName: 'name' } as DbTrajectory;

    const result = buildRowWithSubRowsData(trajectory, [], [], subRowOptions);

    expect(result).toEqual({
      hypothesis: '',
      trajectory,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      isDefault: false,
      isDeletable: true,
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
      isDeletable: false,
      subRows: [
        {
          hypothesis: 'Option A',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          isDeletable: false,
          subRows: null,
        },
        {
          hypothesis: 'Option B',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          isDeletable: false,
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
      isDeletable: true,
      subRows: [
        {
          hypothesis: 'Option A',
          trajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: true,
          isDeletable: false,
          subRows: null,
        },
        {
          hypothesis: 'Option B',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          isDefault: true,
          isDeletable: false,
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

describe('buildEmptyRowWithSubRowsData', () => {
  it('crée une ligne sans sous-lignes quand subRows est vide', () => {
    const result = buildEmptyRowWithSubRowsData('Main hypothesis', [], TRAJECTORY_TYPE.STS);
    expect(result).toEqual({
      hypothesis: 'Main hypothesis',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: true,
      subRows: null,
    });
  });

  it('crée une ligne avec des sous-lignes quand subRows est fourni', () => {
    const result = buildEmptyRowWithSubRowsData('Main hypothesis', ['Sub A', 'Sub B'], TRAJECTORY_TYPE.STS);
    expect(result.hypothesis).toBe('Main hypothesis');
    expect(result.subRows).toHaveLength(2);

    expect(result.subRows?.[0]).toEqual({
      hypothesis: 'Sub A',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
      subRows: null,
    });

    expect(result.subRows?.[1]).toEqual({
      hypothesis: 'Sub B',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
      subRows: null,
    });
  });

  it("assure que la ligne principale est toujours deletable si l'area est non default", () => {
    const result = buildEmptyRowWithSubRowsData('Main hypothesis', ['Sub'], TRAJECTORY_TYPE.STS, [{ name: 'FR' }]);
    expect(result.isDeletable).toBe(true);
    expect(result.isDefault).toBe(false);
  });

  it("assure que la ligne principale est toujours deletable si l'area est non default", () => {
    const result = buildEmptyRowWithSubRowsData('Main hypothesis', ['Sub'], TRAJECTORY_TYPE.STS);
    expect(result.isDeletable).toBe(true);
    expect(result.isDefault).toBe(false);
  });

  it("assure que la ligne principale est non deletable si l'area est default", () => {
    const result = buildEmptyRowWithSubRowsData('Main hypothesis', ['Sub'], TRAJECTORY_TYPE.STS, [
      { name: 'Main hypothesis' },
    ]);
    expect(result.isDeletable).toBe(false);
    expect(result.isDefault).toBe(true);
  });

  it('assure que les sous-lignes sont non default (si pas SPECIFIC PARAM et pas dans la liste des default areas) et non deletable', () => {
    const result = buildEmptyRowWithSubRowsData('Main hypothesis', ['Sub'], TRAJECTORY_TYPE.STS);
    expect(result.subRows?.[0].isDefault).toBe(false);
    expect(result.subRows?.[0].isDeletable).toBe(false);
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

    expect(result.length).toBe(4);

    expect(result[0]).toEqual({
      name: TRAJECTORY_TYPE.AREA,
      label: 'translated:studyDetails.@areas_links',
      icon: StdIconId.LinkedServices,
      isDisabled: false,
    });

    expect(result[1].isDisabled).toBe(false);
    expect(result[2].isDisabled).toBe(false);
    expect(result[3].isDisabled).toBe(true);
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
    expect(getAreaTrajectoryName('0.1', mockData)).toStrictEqual({ area: 'Energy', technology: 'Wind' });
    expect(getAreaTrajectoryName('1.0', mockData)).toStrictEqual({ area: 'Transport', technology: 'Electric' });
  });

  it('should return only main hypothesis if subRow hypothesis is missing', () => {
    const dataWithMissingSubHypothesis = [
      {
        hypothesis: 'Agriculture',
        subRows: [{}],
      },
    ] as HypothesisRowData[];
    expect(getAreaTrajectoryName('0.0', dataWithMissingSubHypothesis)).toStrictEqual({
      area: 'Agriculture',
    });
  });

  it('should return undefined if mainRow is missing', () => {
    expect(getAreaTrajectoryName('5.0', mockData)).toBeUndefined();
  });

  it('should return empty string if both hypotheses are missing', () => {
    const emptyData: HypothesisRowData[] = [{}, {}] as HypothesisRowData[];
    expect(getAreaTrajectoryName('0.0', emptyData)).toBeUndefined();
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

  it('should return technical path for STS', () => {
    expect(getPathFromTrajectoryType(TRAJECTORY_TYPE.STS, 'DSR')).toBe('\\\\STS\\DSR\\clusters');
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
  it('retourne undefined si hypothesis est undefined', () => {
    expect(getQueryParamAreaValue(TRAJECTORY_TYPE.LOAD)).toBeUndefined();
  });

  it('retourne area si hypothesis.area est défini et différent de OTHER_AREAS_LABEL', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.LOAD, 'FR');
    expect(result).toBe('FR');
  });

  it('remplace OTHER_AREAS_LABEL par OTHER_AREAS', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.LOAD, OTHER_AREAS_LABEL);
    expect(result).toBe(OTHER_AREAS);
  });

  // --- THERMAL_CAPACITY ---
  it('THERMAL_CAPACITY : retourne FR si hypothesis.area = FR', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.THERMAL_CAPACITY, 'FR');
    expect(result).toBe('FR');
  });

  it('THERMAL_CAPACITY : retourne OTHER_AREAS si hypothesis.area != FR', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.THERMAL_CAPACITY, 'DE');
    expect(result).toBe(OTHER_AREAS);
  });

  it('THERMAL_CAPACITY : retourne OTHER_AREAS si hypothesis.area est undefined', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.THERMAL_CAPACITY);
    expect(result).toBe(OTHER_AREAS);
  });

  // --- STS & THERMAL_TECHNICAL_SPECIFIC_PARAMETER ---
  it('STS : retourne hypothesis.technology', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.STS, 'HP');
    expect(result).toBe('HP');
  });

  it('THERMAL_TECHNICAL_SPECIFIC_PARAMETER : retourne hypothesis.technology', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 'BOILER');
    expect(result).toBe('BOILER');
  });

  it('STS : retourne undefined si technology est undefined', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.STS);
    expect(result).toBeUndefined();
  });

  // --- THERMAL_TECHNICAL_MODULATION_PARAMETER ---
  it('THERMAL_TECHNICAL_MODULATION_PARAMETER : retourne toujours undefined', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER, 'param');
    expect(result).toBeUndefined();
  });

  // --- THERMAL_TECHNICAL_COMMON_PARAMETER ---
  it('THERMAL_TECHNICAL_COMMON_PARAMETER : retourne toujours undefined', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER, 'common');
    expect(result).toBeUndefined();
  });

  // --- THERMAL_ECONOMIC_COST_PARAMETER ---
  it('THERMAL_ECONOMIC_COST_PARAMETER : retourne toujours undefined', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER, 'cost');
    expect(result).toBeUndefined();
  });

  // --- THERMAL_ECONOMIC_PARAMETER ---
  it('THERMAL_ECONOMIC_PARAMETER : retourne toujours undefined', () => {
    const result = getQueryParamAreaValue(TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER, 'economic');
    expect(result).toBeUndefined();
  });
});

describe('convertIntoHypothesisRowWithTechnologies', () => {
  it('should group by area and generate main entry with subRows', () => {
    const data = [
      { area: 'ZoneA', technology: '', trajectoryName: 'MainTrajectory' },
      { area: 'ZoneA', technology: 'Additional power', trajectoryName: 'Trajectory1' },
      { area: 'ZoneA', technology: 'Biomass', trajectoryName: 'Trajectory2' },
    ] as DbTrajectory[];

    const result = convertIntoHypothesisRowWithTechnologies(data, [], [{ name: 'ZoneA' }], ThermalOptions);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      hypothesis: getDefaultLabel('ZoneA'),
      trajectory: { trajectoryName: 'MainTrajectory' },
      status: TRAJECTORY_SELECTION_STATUS.OK,
      isDefault: true,
      isDeletable: false,
    });
    expect(result[0].subRows).toHaveLength(ThermalOptions.length);
    expect(result[0].subRows?.[0].status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
  });

  it('should return subRows as null if area is OTHER_AREAS', () => {
    const data = [
      { area: OTHER_AREAS, technology: '', trajectoryName: 'MainTrajectory', type: TRAJECTORY_TYPE.THERMAL_CAPACITY },
    ] as DbTrajectory[];
    const result = convertIntoHypothesisRowWithTechnologies(data, [], [], ThermalOptions);

    expect(result[0].subRows).toBeNull();
    expect(result[0].isDefault).toBe(true);
  });

  it('should return status MISSING if trajectoryName is missing', () => {
    const data = [{ area: 'ZoneB', technology: '', trajectoryName: '' }] as DbTrajectory[];
    const result = convertIntoHypothesisRowWithTechnologies(data, [], [], ThermalOptions);

    expect(result[0].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(result[0].trajectory).toBeNull();
  });

  it('should handle undefined defaultAreas', () => {
    const data = [{ area: 'ZoneC', technology: '', trajectoryName: 'TrajectoryX' }] as DbTrajectory[];
    const result = convertIntoHypothesisRowWithTechnologies(data, [], undefined, ThermalOptions);

    expect(result[0].isDefault).toBe(false);
  });

  it('should skip subRows if area is in areasNotInTrajectoryArea', () => {
    const data = [
      { area: 'ZoneD', technology: '', trajectoryName: 'MainTrajectory' },
      { area: 'ZoneD', technology: 'Tech1', trajectoryName: 'Trajectory1' },
    ] as DbTrajectory[];
    const result = convertIntoHypothesisRowWithTechnologies(data, ['ZoneD'], [], ThermalOptions);

    expect(result[0].subRows).toBeNull();
  });
});

describe('generateReadOnlyIndexMap', () => {
  it('génère un index plat sans subRows', () => {
    const data = [{ hypothesis: 'A' }, { hypothesis: 'B' }, { hypothesis: 'C' }] as HypothesisRowData[];

    const result = generateReadOnlyIndexMap(data);
    expect(result).toEqual({
      '0': true,
      '1': true,
      '2': true,
    });
  });

  it('génère un index hiérarchique avec subRows', () => {
    const data = [
      {
        hypothesis: 'Parent 1',
        subRows: [{ hypothesis: 'Child 1' }, { hypothesis: 'Child 2' }],
      },
      {
        name: 'Parent 2',
        subRows: [{ hypothesis: 'Child 3' }],
      },
    ] as HypothesisRowData[];

    const result = generateReadOnlyIndexMap(data);
    expect(result).toEqual({
      '0': true,
      '0.0': true,
      '0.1': true,
      '1': true,
      '1.0': true,
    });
  });

  it('gère les niveaux de profondeur multiples', () => {
    const data = [
      {
        hypothesis: 'Root',
        subRows: [
          {
            hypothesis: 'Level 1',
            subRows: [{ hypothesis: 'Level 2' }],
          },
        ],
      },
    ] as HypothesisRowData[];

    const result = generateReadOnlyIndexMap(data);
    expect(result).toEqual({
      '0': true,
      '0.0': true,
      '0.0.0': true,
    });
  });

  it('retourne un objet figé (readonly)', () => {
    const data = [{ hypothesis: 'A' }] as HypothesisRowData[];
    const result = generateReadOnlyIndexMap(data);

    expect(Object.isFrozen(result)).toBe(true);
  });
});

describe('shouldDeleteParamModulation', () => {
  it('returns true when index is 0, one valid subRow, and second row has valid trajectory/status', () => {
    const data = [
      {
        subRows: [
          { trajectory: 'T1', status: TRAJECTORY_SELECTION_STATUS.OK } as unknown as HypothesisRowData,
          { trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING } as unknown as HypothesisRowData,
        ],
      },
      {
        trajectory: { trajectory: 'T2', status: TRAJECTORY_SELECTION_STATUS.OK } as unknown as DbTrajectory,
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
    ] as HypothesisRowData[];
    expect(shouldDeleteParamModulation(0, data)).toBe(true);
  });

  it('returns false when index is not 0', () => {
    const data: HypothesisRowData[] = [
      {
        subRows: [
          {
            trajectory: { trajectoryName: 'T1', status: TRAJECTORY_SELECTION_STATUS.OK },
            status: TRAJECTORY_SELECTION_STATUS.OK,
          } as unknown as HypothesisRowData,
        ],
      },
      {
        trajectory: { trajectoryName: 'T2', status: TRAJECTORY_SELECTION_STATUS.OK } as unknown as DbTrajectory,
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
    ] as HypothesisRowData[];
    expect(shouldDeleteParamModulation(1, data)).toBe(false);
  });

  it('returns false when subRows has more than one valid trajectory', () => {
    const data: HypothesisRowData[] = [
      {
        subRows: [
          { trajectory: { trajectoryName: 'T1' }, status: TRAJECTORY_SELECTION_STATUS.OK },
          { trajectory: { trajectoryName: 'T2' }, status: TRAJECTORY_SELECTION_STATUS.OK },
        ] as unknown as HypothesisRowData[],
      },
      {
        trajectory: { trajectoryName: 'T3', status: TRAJECTORY_SELECTION_STATUS.OK },
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
    ] as unknown as HypothesisRowData[];
    expect(shouldDeleteParamModulation(0, data)).toBe(false);
  });

  it('returns false when second row has no trajectory', () => {
    const data = [
      {
        subRows: [{ trajectory: 'T1', status: TRAJECTORY_SELECTION_STATUS.OK }],
      },
      {
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
    ] as unknown as HypothesisRowData[];
    expect(shouldDeleteParamModulation(0, data)).toBe(false);
  });

  it('returns false when second row status is not OK', () => {
    const data: HypothesisRowData[] = [
      {
        subRows: [{ trajectory: 'T1', status: TRAJECTORY_SELECTION_STATUS.OK }],
      },
      {
        trajectory: 'T2',
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
      },
    ] as unknown as HypothesisRowData[];
    expect(shouldDeleteParamModulation(0, data)).toBe(false);
  });
});

describe('isUniqueTrajectoryType', () => {
  it('returns true for THERMAL_ECONOMIC_PARAMETER', () => {
    expect(isUniqueTrajectoryType(TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER)).toBe(true);
  });

  it('returns true for THERMAL_TECHNICAL_MODULATION_PARAMETER', () => {
    expect(isUniqueTrajectoryType(TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER)).toBe(true);
  });

  it('returns false for LOAD', () => {
    expect(isUniqueTrajectoryType(TRAJECTORY_TYPE.LOAD)).toBe(false);
  });

  it('returns false for LINK', () => {
    expect(isUniqueTrajectoryType(TRAJECTORY_TYPE.LINK)).toBe(false);
  });
});

describe('isTechnicalParametersType', () => {
  it('returns false for LOAD', () => {
    expect(isTechnicalParametersType(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER)).toBe(true);
  });

  it('returns true for THERMAL_TECHNICAL_MODULATION_PARAMETER', () => {
    expect(isTechnicalParametersType(TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER)).toBe(true);
  });

  it('returns true for THERMAL_ECONOMIC_PARAMETER', () => {
    expect(isTechnicalParametersType(TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER)).toBe(true);
  });

  it('returns false for LINK', () => {
    expect(isTechnicalParametersType(TRAJECTORY_TYPE.LINK)).toBe(false);
  });
});

describe('shouldHaveSubRows', () => {
  const excludedAreas = ['AREA_1', 'AREA_2'];

  it('returns false for thermal capacity in OTHER_AREAS', () => {
    const entry = { type: TRAJECTORY_TYPE.THERMAL_CAPACITY, area: OTHER_AREAS } as DbTrajectory;
    expect(shouldHaveSubRows(excludedAreas, entry)).toBe(false);
  });

  it('returns false for thermal capacity in excluded area', () => {
    const entry = { type: TRAJECTORY_TYPE.THERMAL_CAPACITY, area: 'AREA_1' } as DbTrajectory;
    expect(shouldHaveSubRows(excludedAreas, entry)).toBe(false);
  });

  it('returns true for thermal capacity in non-excluded area', () => {
    const entry = { type: TRAJECTORY_TYPE.THERMAL_CAPACITY, area: 'AREA_3' } as DbTrajectory;
    expect(shouldHaveSubRows(excludedAreas, entry)).toBe(true);
  });

  it('returns true for non-thermal in OTHER_AREAS', () => {
    const entry = { type: 'THERMAL_ECONOMIC_COST_PARAMETER', area: OTHER_AREAS } as DbTrajectory;
    expect(shouldHaveSubRows(excludedAreas, entry)).toBe(true);
  });

  it('returns true for STS and area OTHER_AREAS', () => {
    const entry = { type: 'STS', area: OTHER_AREAS } as DbTrajectory;
    expect(shouldHaveSubRows(excludedAreas, entry)).toBe(true);
  });

  it('returns true for STS and specific area', () => {
    const entry = { type: 'STS', area: 'AREA_3' } as DbTrajectory;
    expect(shouldHaveSubRows(excludedAreas, entry)).toBe(true);
  });

  it('returns true for non-thermal in non-excluded area', () => {
    const entry = { type: 'LINK', area: 'AREA_3' } as DbTrajectory;
    expect(shouldHaveSubRows(excludedAreas, entry)).toBe(true);
  });

  it('returns false for non-thermal in excluded area', () => {
    const entry = { type: 'LOAD', area: 'AREA_1' } as DbTrajectory;
    expect(shouldHaveSubRows(excludedAreas, entry)).toBe(false);
  });

  it('returns true when mainEntry is undefined', () => {
    expect(shouldHaveSubRows(excludedAreas, undefined)).toBe(true);
  });
});

describe('getSubRowsList', () => {
  it('should return technologies when depth is 0 and subRows have technologies', () => {
    const row = {
      depth: 0,
      originalSubRows: [
        { trajectory: { technology: 'AI' }, status: TRAJECTORY_SELECTION_STATUS.OK },
        { trajectory: { technology: 'Blockchain' }, status: TRAJECTORY_SELECTION_STATUS.OK },
      ],
    } as Row<HypothesisRowData>;

    const result = getSubRowsList(row);
    expect(result).toEqual(['AI', 'Blockchain']);
  });

  it('should return area when depth is 0 and subRows have area', () => {
    const row = {
      depth: 0,
      originalSubRows: [
        { trajectory: { area: 'AT' }, status: TRAJECTORY_SELECTION_STATUS.OK },
        { trajectory: { area: 'BE' }, status: TRAJECTORY_SELECTION_STATUS.OK },
      ],
    } as Row<HypothesisRowData>;

    const result = getSubRowsList(row);
    expect(result).toEqual(['AT', 'BE']);
  });

  it('should return empty array when depth is not 0', () => {
    const row = {
      depth: 1,
      originalSubRows: [{ trajectory: { technology: 'AI' } }],
    } as Row<HypothesisRowData>;

    const result = getSubRowsList(row);
    expect(result).toEqual([]);
  });

  it('should skip subRows without technology', () => {
    const row = {
      depth: 0,
      originalSubRows: [{ trajectory: { technology: '' } }, { trajectory: {} }, {}],
    } as Row<HypothesisRowData>;

    const result = getSubRowsList(row);
    expect(result).toEqual([]);
  });

  it('should handle undefined originalSubRows', () => {
    const row = {
      depth: 0,
    } as Row<HypothesisRowData>;

    const result = getSubRowsList(row);
    expect(result).toEqual([]);
  });
});

describe('getSubRowListWithArea', () => {
  const mockT = vi.fn((key: string) => {
    if (key === 'thermal.@installedPowerInformation') return 'Technology filled in';
    if (key === 'thermal.@specificInformation') return 'Specific Info';
    return key;
  }) as unknown as TFunction<'translation', undefined>;

  it('should return message and count for THERMAL_CAPACITY', () => {
    const mockRow = ['Biomass', 'DST'];
    const result = getSubRowListWithArea(mockRow, mockT, TRAJECTORY_TYPE.THERMAL_CAPACITY);
    expect(result).toEqual({
      message: 'Technology filled in: Biomass, DST',
      messageNb: 2,
    });
  });

  it('should return message and count for STS', () => {
    const mockRow = ['DSR'];
    const result = getSubRowListWithArea(mockRow, mockT, TRAJECTORY_TYPE.STS);
    expect(result).toEqual({
      message: 'Technology filled in: DSR',
      messageNb: 1,
    });
  });

  it('should return message and count for THERMAL_TECHNICAL_SPECIFIC_PARAMETER', () => {
    const mockRow = ['AT', 'FR'];
    const result = getSubRowListWithArea(mockRow, mockT, TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER);
    expect(result).toEqual({
      message: 'Specific Info: AT, FR',
      messageNb: 2,
    });
  });

  it('should return empty message and 0 count for other types', () => {
    const mockRow = [] as string[];
    const result = getSubRowListWithArea(mockRow, mockT, TRAJECTORY_TYPE.LINK);
    expect(result).toEqual({
      message: '',
      messageNb: 0,
    });
  });

  it('should return empty message and 0 count if type is undefined', () => {
    const mockRow = [] as string[];
    const result = getSubRowListWithArea(mockRow, mockT);
    expect(result).toEqual({
      message: '',
      messageNb: 0,
    });
  });
});

describe('filterRow', () => {
  it('garde toujours les rows avec isDefault et isDeletable', () => {
    const data: HypothesisRowData[] = [
      { status: TRAJECTORY_SELECTION_STATUS.ERROR, isDefault: true, isDeletable: true },
      { status: TRAJECTORY_SELECTION_STATUS.ERROR, isDefault: false, isDeletable: false },
    ] as unknown as HypothesisRowData[];
    const result = filterRow(data);
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(result[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
  });

  it('garde une row en ERROR si elle a des subRows non vides', () => {
    const data: HypothesisRowData[] = [
      {
        status: TRAJECTORY_SELECTION_STATUS.ERROR,
        subRows: [{ status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { trajectoryName: 'name' } as DbTrajectory }],
      },
    ] as unknown as HypothesisRowData[];
    const result = filterRow(data);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(result[0].trajectory).toBeNull();
    expect(result[0].subRows).not.toBeNull();
    expect(result[0].subRows?.length).toBe(1);
  });

  it('supprime une row en ERROR si subRows est vide', () => {
    const data: HypothesisRowData[] = [
      { status: TRAJECTORY_SELECTION_STATUS.ERROR, isDeletable: true, subRows: [] },
    ] as unknown as HypothesisRowData[];
    const result = filterRow(data);
    expect(result).toHaveLength(0);
  });

  it('filtre les subRows avec trajectory et status OK', () => {
    const data: HypothesisRowData[] = [
      {
        status: TRAJECTORY_SELECTION_STATUS.ERROR,
        subRows: [
          { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { trajectoryName: 'name' } as DbTrajectory },
          { status: TRAJECTORY_SELECTION_STATUS.ERROR, trajectory: { trajectoryName: 'name' } as DbTrajectory },
        ] as unknown as HypothesisRowData[],
      },
    ] as unknown as HypothesisRowData[];
    const result = filterRow(data);
    expect(result[0].subRows).toHaveLength(1);
    expect(result[0].subRows?.[0].status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
    expect(result[0].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(result[0].trajectory).toBeNull();
  });

  it('transforme ERROR en MISSING si subRows OK existent', () => {
    const data: HypothesisRowData[] = [
      {
        status: TRAJECTORY_SELECTION_STATUS.ERROR,
        subRows: [
          { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { trajectoryName: 'name' } as DbTrajectory },
        ] as unknown as HypothesisRowData[],
      },
    ] as unknown as HypothesisRowData[];
    const result = filterRow(data);
    expect(result[0].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(result[0].trajectory).toBeNull();
  });

  it('supprime les rows inutiles (ni default, deletable, ni OK/MISSING)', () => {
    const data: HypothesisRowData[] = [
      { status: TRAJECTORY_SELECTION_STATUS.ERROR, isDeletable: true },
    ] as unknown as HypothesisRowData[];
    const result = filterRow(data);
    expect(result).toHaveLength(0);
  });

  it('garde les rows non isDeletable même si status ERROR', () => {
    const data: HypothesisRowData[] = [
      { status: TRAJECTORY_SELECTION_STATUS.ERROR, isDeletable: false },
    ] as unknown as HypothesisRowData[];
    const result = filterRow(data);
    expect(result).toHaveLength(1);
  });
});
