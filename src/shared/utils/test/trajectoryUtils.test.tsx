import {
  addNestedRow,
  buildEmptyTrajectory,
  buildErrorTrajectory,
  buildReadOnlyRow,
  buildRowData,
  buildRowWithSubRowsData,
  checkNestedValue,
  getBgColor,
  getStatus,
  getStudyMenu,
  isMatchingTrajectoryType,
  removeDuplicate,
  removeRowAndSubRow,
  retrieveReadOnlyArea,
  unCheckNestedValue,
} from '../trajectoryUtils';
import { defaultAreaNotInAreaTrajectoryList, rowData, rowDataTwo } from '@/mocks/data/tests/hypothesisTable.mock.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { afterEach, beforeEach, vi } from 'vitest';
import {
  mockDbTrajectory,
  mockDbTrajectoryArrayWithDuplicate,
  mockRowDataTrajectoryA,
  mockRowDataTrajectoryB,
  mockRowDataTrajectoryC,
} from '@/mocks/data/tests/trajectory.mock.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { DbTrajectory, HypothesisRowData, HypothesisTab, NestedCheckedType } from '@/shared/types';
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

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
    const errorTrajectory = buildErrorTrajectory(TRAJECTORY_TYPE.AREA, 3, 'trajectory', 'error message', 'CE', 'FR');
    expect(errorTrajectory).toStrictEqual({
      id: 3,
      trajectoryName: 'trajectory',
      type: TRAJECTORY_TYPE.AREA,
      version: 0,
      userName: 'CE',
      creationDate: date,
      loadArea: 'FR',
      messages: [
        {
          id: 10,
          content: 'error message',
          level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
          code: 'ERROR',
          generatedBy: 'CE',
          generatedAt: date,
          trajectory: 'trajectory',
          secondTrajectory: '',
          isAck: false,
        },
      ],
      state: TRAJECTORY_SELECTION_STATUS.ERROR,
    });
  });

  it('should return an error trajectory', () => {
    const date = new Date(2000, 1, 1, 13);
    vi.setSystemTime(date);
    const errorTrajectory = buildErrorTrajectory(TRAJECTORY_TYPE.AREA, 3, 'trajectory', undefined, undefined, 'FR');
    expect(errorTrajectory).toStrictEqual({
      id: 3,
      trajectoryName: 'trajectory',
      type: TRAJECTORY_TYPE.AREA,
      version: 0,
      userName: 'unknown_user',
      creationDate: date,
      loadArea: 'FR',
      messages: [
        {
          id: 10,
          content: 'Error',
          level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
          code: 'ERROR',
          generatedBy: 'unknown_user',
          generatedAt: date,
          trajectory: 'trajectory',
          secondTrajectory: '',
          isAck: false,
        },
      ],
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
  it('generates a trajectory with expected default fields', () => {
    const area = 'ZoneX';
    const type: TRAJECTORY_TYPE = TRAJECTORY_TYPE.AREA;

    const result: DbTrajectory = buildEmptyTrajectory(area, type);

    expect(result.loadArea).toBe(area);
    expect(result.type).toBe(type);
    expect(result.trajectoryName).toBe('');
    expect(result.version).toBe(0);
    expect(result.userName).toBe('user');
    expect(result.state).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(result.messages).toEqual([]);
    expect(result.creationDate).toBeInstanceOf(Date);
  });

  it('generates a unique id each time', () => {
    const t1 = buildEmptyTrajectory('ZoneA', TRAJECTORY_TYPE.AREA);
    const t2 = buildEmptyTrajectory('ZoneA', TRAJECTORY_TYPE.LINK);

    expect(t1.id).not.toBe(t2.id);
  });
});

describe('buildRowWithSubRowsData', () => {
  it('returns empty array when input is empty', () => {
    const result = buildRowWithSubRowsData([]);
    expect(result).toEqual([]);
  });

  it('creates row data with correct structure', () => {
    const input = [{ name: 'ZoneA' }, { name: 'ZoneB' }];
    const result = buildRowWithSubRowsData(input);

    expect(result.length).toBe(2);
    expect(result[0].hypothesis).toBe('ZoneA');
    expect(result[1].hypothesis).toBe('ZoneB');

    for (const row of result) {
      expect(row.trajectory).toBeNull();
      expect(row.status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
      expect(row.isDefault).toBe(true);
      expect(Array.isArray(row.subRows)).toBe(true);
      expect(row.subRows.length).toBe(ThermalOptions.length);

      for (const sub of row.subRows) {
        expect(sub.hypothesis).toBeDefined();
        expect(sub.trajectory).toBeNull();
        expect(sub.status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
        expect(sub.isDefault).toBe(true);
        expect(sub.subRows).toBeNull();
      }
    }
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

describe('checkNestedValue', () => {
  const baseItem: NestedCheckedType = { name: 'parent1', subOptions: null };

  it('should add a new subOption to an item with no subOptions', () => {
    const data = [baseItem];
    const result = checkNestedValue(data, 'option1', 'parent1');

    expect(result[0].subOptions).toEqual(['option1']);
  });

  it('should append and sort subOptions alphabetically', () => {
    const data: NestedCheckedType[] = [{ name: 'parent1', subOptions: ['optionB'] }];
    const result = checkNestedValue(data, 'optionA', 'parent1');

    expect(result[0].subOptions).toEqual(['optionA', 'optionB']);
  });

  it('should not duplicate subOptions if value already exists', () => {
    const data: NestedCheckedType[] = [{ name: 'parent1', subOptions: ['option1'] }];
    const result = checkNestedValue(data, 'option1', 'parent1');

    expect(result[0].subOptions).toEqual(['option1']);
  });

  it('should not modify items if parentValue does not match', () => {
    const data = [baseItem];
    const result = checkNestedValue(data, 'option1', 'nonexistent');

    expect(result).toEqual(data);
  });

  it('should handle undefined parentValue gracefully', () => {
    const data = [baseItem];
    const result = checkNestedValue(data, 'option1');

    expect(result).toEqual(data);
  });
});

describe('removeRowAndSubRow', () => {
  const subRowChild1 = {
    hypothesis: 'Child1',
    trajectory: mockDbTrajectory,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
  };
  const subRowChild2 = {
    hypothesis: 'Child2',
    trajectory: mockDbTrajectory,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
  };
  const data: HypothesisRowData[] = [
    {
      hypothesis: 'Parent1',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: [subRowChild1, subRowChild2],
    },
  ];
  const dataWithChild1: HypothesisRowData[] = [
    {
      hypothesis: 'Parent1',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: [{ hypothesis: 'Child1', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.MISSING }],
    },
  ];
  const dataWithTreeChildren: HypothesisRowData[] = [
    {
      hypothesis: 'Parent1',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: [
        { hypothesis: 'Zebra', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.MISSING },
        { hypothesis: 'Apple', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.MISSING },
        { hypothesis: 'Banana', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      ],
    },
  ];
  const dataOnlyChild: HypothesisRowData[] = [
    {
      hypothesis: 'Parent1',
      trajectory: mockDbTrajectory,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: [{ hypothesis: 'OnlyChild', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.MISSING }],
    },
  ];

  it('should remove a matching subRow from the correct parent', () => {
    const result = removeRowAndSubRow(data, 'Child1', 'Parent1');
    expect(result[0].subRows).toEqual([subRowChild2]);
  });

  it('should sort remaining subRows alphabetically after removal', () => {
    const result = removeRowAndSubRow(dataWithTreeChildren, 'Zebra', 'Parent1');
    expect(result[0].subRows).toEqual([
      { hypothesis: 'Apple', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: 'Banana', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    ]);
  });

  it('should set subRows to null if the last subRow is removed', () => {
    const result = removeRowAndSubRow(dataOnlyChild, 'OnlyChild', 'Parent1');
    expect(result[0].subRows).toBeNull();
  });

  it('should not modify data if parentValue does not match', () => {
    const result = removeRowAndSubRow(data, 'Child1', 'NonExistentParent');
    expect(result).toEqual(data);
  });

  it('should not fail if subRows is undefined', () => {
    const result = removeRowAndSubRow(dataWithChild1, 'Child1', 'Parent1');
    expect(result[0].subRows).toBeNull();
  });
});

describe('unCheckNestedValue', () => {
  it('should remove a value from subOptions of the correct parent', () => {
    const data: NestedCheckedType[] = [{ name: 'Parent1', subOptions: ['A', 'B', 'C'] }];
    const result = unCheckNestedValue(data, 'B', 'Parent1');
    expect(result[0].subOptions).toEqual(['A', 'C']);
  });

  it('should set subOptions to null if the last value is removed', () => {
    const data: NestedCheckedType[] = [{ name: 'Parent1', subOptions: ['OnlyOne'] }];
    const result = unCheckNestedValue(data, 'OnlyOne', 'Parent1');
    expect(result[0].subOptions).toBeNull();
  });

  it('should not modify the item if value is not found in subOptions', () => {
    const data: NestedCheckedType[] = [{ name: 'Parent1', subOptions: ['X', 'Y'] }];
    const result = unCheckNestedValue(data, 'Z', 'Parent1');
    expect(result[0].subOptions).toEqual(['X', 'Y']);
  });

  it('should not modify the item if parentValue does not match', () => {
    const data: NestedCheckedType[] = [{ name: 'Parent1', subOptions: ['A'] }];
    const result = unCheckNestedValue(data, 'A', 'NonExistentParent');
    expect(result).toEqual(data);
  });

  it('should handle null subOptions gracefully', () => {
    const data: NestedCheckedType[] = [{ name: 'Parent1', subOptions: null }];
    const result = unCheckNestedValue(data, 'A', 'Parent1');
    expect(result[0].subOptions).toBeNull();
  });

  it('should handle undefined parentValue gracefully', () => {
    const data: NestedCheckedType[] = [{ name: 'Parent1', subOptions: ['A'] }];
    const result = unCheckNestedValue(data, 'A');
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
