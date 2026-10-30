import {
  addTrajectories,
  clearByType,
  deleteTrajectory,
  studyReducer,
  updateHvdcOption,
  updateTrajectory,
} from '@/store/reducers/studyReducer';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import {
  DbTrajectory,
  FileInputStatus,
  RowStatus,
  StudyActionType,
  StudyState,
  StudyTrajectoriesData,
  WarningMessage,
} from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { describe, expect, it } from 'vitest';
import { mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { mockDataBaseTrajectory, mockPrevStateArea, mockPrevStateLoad } from '@/mocks/data/tests/trajectory.mock.ts';

describe('addTrajectories', () => {
  it.each([TRAJECTORY_TYPE.AREA, TRAJECTORY_TYPE.LINK])('should replace existing %s trajectories without mutating the previous state', (type) => {
    const existing = mockDataBaseTrajectory(type, 1, 'FR');
    const incoming = mockDataBaseTrajectory(type, 2, 'DE');
    const prevState: Partial<StudyState> = { [type]: { trajectories: [existing] }, hvdc: true };

    const result = addTrajectories(prevState, { [type]: { trajectories: [incoming] } });

    expect(result[type]?.trajectories).toEqual([incoming]);
    expect(result.hvdc).toBe(true);
    expect(prevState[type]?.trajectories).toEqual([existing]);
  });

  it('should deduplicate by area and technology rather than trajectory id', () => {
    const existing = { ...mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 1, 'FR'), technology: 'Solar' };
    const duplicate = { ...existing, id: 2 };
    const otherTechnology = { ...existing, id: 3, technology: 'Wind' };
    const otherArea = { ...existing, id: 4, area: 'DE' };
    const prevState = { LOAD: { trajectories: [existing] } };
    const incoming = { LOAD: { trajectories: [duplicate, otherTechnology, otherArea] } };

    const result = addTrajectories(prevState, incoming);

    expect(result.LOAD?.trajectories).toEqual([existing, otherTechnology, otherArea]);
    expect(prevState.LOAD.trajectories).toEqual([existing]);
    expect(incoming.LOAD.trajectories).toEqual([duplicate, otherTechnology, otherArea]);
  });

  it('should add new trajectories to empty state', () => {
    const trajectory = mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 67, 'AT');

    const result = addTrajectories({}, { [TRAJECTORY_TYPE.AREA]: { trajectories: [trajectory] } });

    expect(result[TRAJECTORY_TYPE.AREA]?.trajectories).toEqual([trajectory]);
  });

  it('should merge with existing trajectories and preserve warningMessages if no messages is added', () => {
    const existingTrajectory = mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 56, 'AT');
    const newTrajectory = mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 90, 'FR');

    const prevState = {
      [TRAJECTORY_TYPE.LOAD]: {
        trajectories: [existingTrajectory],
      },
    };

    const result = addTrajectories(prevState, {
      [TRAJECTORY_TYPE.LOAD]: {
        trajectories: [newTrajectory],
      },
    });

    expect(result[TRAJECTORY_TYPE.LOAD]?.trajectories).toContainEqual(existingTrajectory);
    expect(result[TRAJECTORY_TYPE.LOAD]?.trajectories).toContainEqual(newTrajectory);
    expect(result[TRAJECTORY_TYPE.LOAD]?.trajectories).toHaveLength(2);
  });

  it('should merge with existing trajectories and warningMessages', () => {
    const existingTrajectory = mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 56, 'AT');
    const newTrajectory = mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 90, 'FR');

    const prevState = {
      [TRAJECTORY_TYPE.LOAD]: {
        trajectories: [existingTrajectory],
        warningMessages: mockWarningMessagesWithTwo,
      },
    };

    const result = addTrajectories(prevState, {
      [TRAJECTORY_TYPE.LOAD]: {
        trajectories: [newTrajectory],
      },
    });

    expect(result[TRAJECTORY_TYPE.LOAD]?.trajectories).toContainEqual(existingTrajectory);
    expect(result[TRAJECTORY_TYPE.LOAD]?.trajectories).toContainEqual(newTrajectory);
    expect(result[TRAJECTORY_TYPE.LOAD]?.trajectories).toHaveLength(2);
  });

  it('deduplicates trajectories and warningMessages', () => {
    const prevState = {
      LOAD: {
        trajectories: [
          { id: 1, area: 'FR' },
          { id: 2, area: 'CZ' },
        ] as DbTrajectory[],
        warningMessages: [{ id: 'Warning A' }] as unknown as WarningMessage[],
      },
    };
    const data = {
      LOAD: {
        trajectories: [
          { id: 2, area: 'CZ' },
          { id: 3, area: 'BE' },
        ] as DbTrajectory[],
        warningMessages: [{ id: 'Warning A' }, { id: 'Warning B' }] as unknown as WarningMessage[],
      },
    };
    const result = addTrajectories(prevState, data);
    expect(result.LOAD?.trajectories).toEqual(
      expect.arrayContaining([
        { id: 1, area: 'FR' },
        { id: 2, area: 'CZ' },
        { id: 3, area: 'BE' },
      ]),
    );
  });

  it('should preserve unrelated trajectory types', () => {
    const prevState = {
      LINK: {
        trajectories: [
          {
            id: 56,
            type: TRAJECTORY_TYPE.LINK,
            trajectoryName: 'Link-Trajectory',
            version: 1,
            userName: 'CF',
            creationDate: '2025' as unknown as Date,
            area: 'CZ',
            technology: '',
            hasTimeSeries: false,
          },
        ],
        warningMessages: [],
      },
    };
    const areaTraj = mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 56, 'CZ');

    const result = addTrajectories(prevState, {
      [TRAJECTORY_TYPE.AREA]: { trajectories: [areaTraj] },
    });

    expect(result['LINK']).toEqual(prevState['LINK']);
    expect(result[TRAJECTORY_TYPE.AREA]?.trajectories).toEqual([areaTraj]);
  });

  it('should handle multiple types in one call', () => {
    const areaTraj = mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 45, 'FR');
    const linkTraj = mockDataBaseTrajectory(TRAJECTORY_TYPE.LINK, 23, 'DA');

    const result = addTrajectories(
      {},
      {
        [TRAJECTORY_TYPE.AREA]: { trajectories: [areaTraj] },
        [TRAJECTORY_TYPE.LINK]: { trajectories: [linkTraj] },
      },
    );

    expect(result[TRAJECTORY_TYPE.AREA]?.trajectories).toEqual([areaTraj]);
    expect(result[TRAJECTORY_TYPE.LINK]?.trajectories).toEqual([linkTraj]);
  });

  it('should return change state if data is full', () => {
    const prevState: Partial<StudyState> = {
      AREA: {
        trajectories: [],
      },
    };
    const areaTraj = mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 56, 'CZ');
    const result = addTrajectories(prevState, {
      AREA: { trajectories: [areaTraj] },
    });
    expect(result?.AREA?.trajectories).toEqual([areaTraj]);
  });

  it('should return empty array for trajectories and warningMessages if data is empty', () => {
    const prevState: Partial<StudyState> = {
      AREA: {
        trajectories: [],
      },
    };
    const result = addTrajectories(prevState, {
      AREA: { trajectories: [] },
    });
    expect(result?.AREA?.trajectories).toEqual([]);
  });

  it('returns prevState when data is empty', () => {
    const prevState = { AREA: { trajectories: [], warningMessages: [] } };
    const result = addTrajectories(prevState, {});
    expect(result).toEqual(prevState);
  });

  it('handles missing trajectories and warningMessages gracefully', () => {
    const prevState = { AREA: { trajectories: [], warningMessages: [] } };
    const data = { AREA: {} } as StudyTrajectoriesData;
    const result = addTrajectories(prevState, data);
    expect(result).toEqual({ AREA: {} });
  });

  it('handles non-array trajectories and warningMessages', () => {
    const prevState = { LOAD: { trajectories: [], warningMessages: [] } };
    const data = {
      LOAD: {
        trajectories: 'not an array',
        warningMessages: null,
      },
    } as unknown as StudyTrajectoriesData;
    const result = addTrajectories(prevState, data);
    expect(result).toEqual(prevState);
  });
});

describe('deleteTrajectory', () => {
  it('should initialize an absent trajectory type without changing unrelated types', () => {
    const prevState = mockPrevStateArea();

    const result = deleteTrajectory(prevState, { area: 'FR', type: TRAJECTORY_TYPE.LOAD });

    expect(result.LOAD?.trajectories).toEqual([]);
    expect(result.AREA).toBe(prevState.AREA);
  });

  it('should clear only matching areas and preserve other technologies and metadata', () => {
    const first = mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 1, 'FR');
    const second = { ...first, id: 2, technology: 'Wind' };
    const retained = { ...first, id: 3, area: 'DE' };
    const prevState = {
      LOAD: { trajectories: [first, second, retained], warningMessages: mockWarningMessagesWithTwo },
    };

    const result = deleteTrajectory(prevState, { area: 'FR', type: TRAJECTORY_TYPE.LOAD });

    expect(result.LOAD).toEqual({
      trajectories: [retained],
      warningMessages: mockWarningMessagesWithTwo,
    });
  });

  it('should initialize missing modulation trajectories when deleting the last specific trajectory', () => {
    const type = TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER;
    const prevState = { [type]: { trajectories: [mockDataBaseTrajectory(type, 1, 'FR')] } };

    const result = deleteTrajectory(prevState, { area: 'FR', type });

    expect(result[type]?.trajectories).toEqual([]);
    expect(result.THERMAL_TECHNICAL_MODULATION_PARAMETER?.trajectories).toEqual([]);
  });

  const baseTrajectory = {
    id: '1',
    area: 'Zone A',
    technology: 'Tech X',
    type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    trajectoryName: 'Initial',
  };

  it('should remove trajectory with matching area', () => {
    const prevState = {
      studyStatus: StudyStatus.IN_PROGRESS,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [baseTrajectory],
      },
    } as unknown as Partial<StudyState>;

    const payload = {
      area: 'Zone A',
      type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    };

    const result = deleteTrajectory({ ...prevState }, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories).toHaveLength(0);
  });

  it('should not remove trajectory with different area', () => {
    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [baseTrajectory],
      },
    } as unknown as Partial<StudyState>;

    const payload = {
      area: 'Zone B',
      type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    };

    const result = deleteTrajectory({ ...prevState }, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories).toHaveLength(1);
  });

  it('should clear trajectories for AREA type', () => {
    const prevState = {
      [TRAJECTORY_TYPE.AREA]: {
        trajectories: [baseTrajectory],
      },
    } as unknown as Partial<StudyState>;

    const payload = {
      area: 'Zone A',
      type: TRAJECTORY_TYPE.AREA,
    };

    const result = deleteTrajectory({ ...prevState }, payload);

    expect(result[TRAJECTORY_TYPE.AREA]?.trajectories).toEqual([]);
  });

  it('should clear trajectories for LINK type', () => {
    const prevState = {
      [TRAJECTORY_TYPE.LINK]: {
        trajectories: [baseTrajectory],
      },
    } as unknown as Partial<StudyState>;

    const payload = {
      area: 'Zone A',
      type: TRAJECTORY_TYPE.LINK,
    };

    const result = deleteTrajectory({ ...prevState }, payload);

    expect(result[TRAJECTORY_TYPE.LINK]?.trajectories).toEqual([]);
  });

  it('should clear modulation trajectory names if all specific trajectories have empty names', () => {
    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [{ ...baseTrajectory, trajectoryName: '' }],
      },
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: {
        trajectories: [
          { id: 'mod1', trajectoryName: 'Mod A' },
          { id: 'mod2', trajectoryName: 'Mod B' },
        ],
      },
    } as unknown as Partial<StudyState>;

    const payload = {
      area: 'Zone A',
      type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    };

    const result = deleteTrajectory({ ...prevState }, payload);

    expect(
      result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]?.trajectories.every(
        (t) => t.trajectoryName === '',
      ),
    ).toBe(true);
  });

  it('should not modify modulation trajectories if some specific trajectories have names', () => {
    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [{ ...baseTrajectory, trajectoryName: 'Still here' }],
      },
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: {
        trajectories: [{ id: 'mod1', trajectoryName: 'Mod A' }],
      },
    } as unknown as Partial<StudyState>;

    const payload = {
      area: 'Zone B',
      type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    };

    const result = deleteTrajectory({ ...prevState }, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]?.trajectories[0].trajectoryName).toBe(
      'Mod A',
    );
  });
});

describe('clearByType', () => {
  const prevState = {
    studyStatus: StudyStatus.IN_PROGRESS,
    AREA: {
      trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 123, 'zoneA')],
      warningMessages: [],
    },
    LINK: {
      trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.LINK, 567, 'zoneB')],
      warningMessages: [],
    },
    LOAD: {
      trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 987, 'zoneC')],
      warningMessages: [],
    },
  };

  it('should clears matching trajectory types by setting them to null', () => {
    const payload = [TRAJECTORY_TYPE.AREA, TRAJECTORY_TYPE.LOAD];
    const result = clearByType(prevState, payload);

    expect(result).toEqual({
      studyStatus: StudyStatus.IN_PROGRESS,
      AREA: { trajectories: [], warningMessages: [] },
      LINK: { trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.LINK, 567, 'zoneB')], warningMessages: [] },
      LOAD: { trajectories: [], warningMessages: [] },
    });
  });

  it('should returns unchanged state if no types match', () => {
    const payload = [TRAJECTORY_TYPE.THERMAL_CAPACITY, TRAJECTORY_TYPE.THERMAL_COST];
    const result = clearByType(prevState, payload);

    expect(result).toEqual(prevState);
  });

  it('should handles empty payload correctly', () => {
    const payload: TRAJECTORY_TYPE[] = [];
    const result = clearByType(prevState, payload);

    expect(result).toEqual(prevState);
  });

  it('should preserves keys not in TRAJECTORY_TYPE enum', () => {
    const payload = [TRAJECTORY_TYPE.AREA];
    const result = clearByType(prevState, payload);
    expect(result.studyStatus).toEqual(StudyStatus.IN_PROGRESS);
    expect(result[TRAJECTORY_TYPE.AREA]?.trajectories).toHaveLength(0);
  });

  it('should preserve metadata and leave the previous state unchanged', () => {
    const state = {
      ...prevState,
      LOAD: { ...prevState.LOAD, warningMessages: mockWarningMessagesWithTwo },
    };

    const result = clearByType(state, [TRAJECTORY_TYPE.LOAD]);

    expect(result.LOAD).toEqual({ trajectories: [], warningMessages: mockWarningMessagesWithTwo });
    expect(result.LINK).toBe(state.LINK);
    expect(state.LOAD.trajectories).toHaveLength(1);
  });

  it('should return the same empty state when there are no keys to clear', () => {
    const state = {};

    expect(clearByType(state, [TRAJECTORY_TYPE.AREA])).toBe(state);
  });
});

describe('updateTrajectory', () => {
  it.each(['empty', 'success', 'emptyError', 'error'] as const)('should update LINK dependencies for status %s without mutating the previous state', (status) => {
    const link = mockDataBaseTrajectory(TRAJECTORY_TYPE.LINK, 1, '');
    const flowbased = mockDataBaseTrajectory(TRAJECTORY_TYPE.FLOWBASED, 2, '');
    const secondFlowbased = { ...flowbased, id: 3 };
    const prevState = {
      hvdc: true,
      LINK: { trajectories: [link] },
      FLOWBASED: { trajectories: [flowbased, secondFlowbased] },
      LOAD: { trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 4, 'FR')] },
    };

    const result = updateTrajectory(prevState, { trajectory: link, status });

    expect(result.hvdc).toBe(status !== 'empty');
    expect(result.LINK?.trajectories).toEqual([
      { ...link, trajectoryName: status === 'success' ? link.trajectoryName : '' },
    ]);
    expect(result.FLOWBASED?.trajectories).toEqual([
      { ...flowbased, trajectoryName: '' },
      { ...secondFlowbased, trajectoryName: '' },
    ]);
    expect(result.LOAD).toBe(prevState.LOAD);
    expect(prevState.hvdc).toBe(true);
    expect(prevState.LINK.trajectories).toEqual([link]);
    expect(prevState.FLOWBASED.trajectories).toEqual([flowbased, secondFlowbased]);
    expect(flowbased.trajectoryName).not.toBe('');
  });

  it('should initialize FLOWBASED when updating LINK without existing FLOWBASED data', () => {
    const link = mockDataBaseTrajectory(TRAJECTORY_TYPE.LINK, 1, '');

    const result = updateTrajectory({}, { trajectory: link, status: 'success' });

    expect(result.LINK?.trajectories).toEqual([link]);
    expect(result.FLOWBASED?.trajectories).toEqual([]);
  });

  it.each([true, false])('should preserve hvdc=%s and FLOWBASED when detaching another type', (hvdc) => {
    const load = mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 1, 'FR');
    const prevState = {
      hvdc,
      LOAD: { trajectories: [load] },
      FLOWBASED: { trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.FLOWBASED, 2, '')] },
    };

    const result = updateTrajectory(prevState, { trajectory: load, status: 'empty' });

    expect(result.hvdc).toBe(hvdc);
    expect(result.FLOWBASED).toBe(prevState.FLOWBASED);
  });

  it('should replace only the matching area and technology and preserve metadata', () => {
    const first = { ...mockDataBaseTrajectory(TRAJECTORY_TYPE.LOAD, 1, 'FR'), technology: 'Solar' };
    const second = { ...first, id: 2, technology: 'Wind' };
    const third = { ...first, id: 3, area: 'DE' };
    const replacement = { ...first, id: 4, trajectoryName: 'Replacement' };
    const prevState = {
      LOAD: { trajectories: [first, second, third], warningMessages: mockWarningMessagesWithTwo },
    };

    const result = updateTrajectory(prevState, { trajectory: replacement, status: 'success' });

    expect(result.LOAD).toEqual({
      trajectories: [replacement, second, third],
      warningMessages: mockWarningMessagesWithTwo,
    });
    expect(prevState.LOAD.trajectories).toEqual([first, second, third]);
  });

  it('should preserve modulation when another specific trajectory still has a name', () => {
    const type = TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER;
    const first = mockDataBaseTrajectory(type, 1, 'FR');
    const second = mockDataBaseTrajectory(type, 2, 'DE');
    const modulation = mockDataBaseTrajectory(TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER, 3, '');
    const prevState = {
      [type]: { trajectories: [first, second] },
      THERMAL_TECHNICAL_MODULATION_PARAMETER: { trajectories: [modulation] },
    };

    const result = updateTrajectory(prevState, { trajectory: first, status: 'empty' });

    expect(result[type]?.trajectories).toEqual([{ ...first, trajectoryName: '' }, second]);
    expect(result.THERMAL_TECHNICAL_MODULATION_PARAMETER).toBe(prevState.THERMAL_TECHNICAL_MODULATION_PARAMETER);
  });

  it('should initialize missing modulation when the last specific trajectory is cleared', () => {
    const type = TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER;
    const trajectory = mockDataBaseTrajectory(type, 1, 'FR');

    const result = updateTrajectory(
      { [type]: { trajectories: [trajectory] } },
      { trajectory, status: 'empty' },
    );

    expect(result.THERMAL_TECHNICAL_MODULATION_PARAMETER?.trajectories).toEqual([]);
  });

  const baseTrajectory = {
    id: '1',
    area: 'Zone A',
    technology: 'Tech X',
    type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    trajectoryName: 'Initial',
  } as unknown as DbTrajectory;

  it('should update trajectoryName on success for matching trajectory', () => {
    const prevState = {
      studyStatus: StudyStatus.IN_PROGRESS,
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [baseTrajectory] as DbTrajectory[],
      },
    } as Partial<StudyState>;

    const payload = {
      trajectory: { ...baseTrajectory, trajectoryName: 'Updated' } as DbTrajectory,
      status: 'success' as RowStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories[0].trajectoryName).toBe(
      'Updated',
    );
  });

  it('should clear trajectoryName on failure for matching trajectory', () => {
    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [baseTrajectory],
      },
    };

    const payload = {
      trajectory: { ...baseTrajectory, trajectoryName: 'Should be cleared' } as DbTrajectory,
      status: 'error' as RowStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories[0].trajectoryName).toBe('');
  });

  it('should replace trajectory if same area/tech/type but different id', () => {
    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [baseTrajectory],
      },
    };

    const payload = {
      trajectory: { ...baseTrajectory, id: '2', trajectoryName: 'New Trajectory' } as unknown as DbTrajectory,
      status: 'success' as RowStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories[0].id).toBe('2');
    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories[0].trajectoryName).toBe(
      'New Trajectory',
    );
  });

  it('should trigger isMultipleUpdate and clear modulation trajectory names', () => {
    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [{ ...baseTrajectory, trajectoryName: 'To be cleared' }],
      },
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: {
        trajectories: [
          { id: 'mod1', trajectoryName: 'Modulation A' },
          { id: 'mod2', trajectoryName: 'Modulation B' },
        ],
      },
    } as unknown as Partial<StudyState>;

    const payload = {
      trajectory: { ...baseTrajectory, trajectoryName: '', id: '1' } as unknown as DbTrajectory,
      status: 'error' as RowStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(
      result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]?.trajectories.every(
        (t) => t.trajectoryName === '',
      ),
    ).toBe(true);
  });

  it('should add trajectory if not already in prevState', () => {
    const baseTrajectoryMock = [
      {
        id: '14',
        area: 'Zone B',
        technology: 'Tech X1',
        type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
        trajectoryName: 'Initial',
      },
    ] as unknown as DbTrajectory[];

    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: baseTrajectoryMock,
      },
    };

    const payload = {
      trajectory: baseTrajectory,
      status: 'success' as RowStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories).toContainEqual(baseTrajectory);
    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories).toHaveLength(2);
  });

  it('should add trajectory to empty state when updating', () => {
    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        trajectories: [],
      },
    };

    const payload = {
      trajectory: baseTrajectory,
      status: 'success' as RowStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]?.trajectories).toEqual([baseTrajectory]);
  });

  it('should update unique trajectory type by replacing it when matching type', () => {
    const uniqueTrajectory = {
      id: '1',
      type: TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER,
      trajectoryName: 'Old Trajectory',
    } as unknown as DbTrajectory;

    const newUniqueTrajectory = {
      id: '2',
      type: TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER,
      trajectoryName: 'New Trajectory',
    } as unknown as DbTrajectory;

    const prevState = {
      [TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER]: {
        trajectories: [uniqueTrajectory],
      },
    };

    const payload = {
      trajectory: newUniqueTrajectory,
      status: 'success' as RowStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER]?.trajectories).toEqual([newUniqueTrajectory]);
  });
});

describe('updateHvdcOption', () => {
  it('should return prevState proper hvdc value', () => {
    const prevState = {
      hvdc: false,
    };

    const result = updateHvdcOption(prevState, true);

    expect(result.hvdc).toEqual(true);
  });

  it('should return prevState proper hvdc value', () => {
    const prevState = {
      hvdc: true,
    };

    const result = updateHvdcOption(prevState, false);

    expect(result.hvdc).toEqual(false);
  });
});

describe('studyReducer', () => {
  it('should replace study areas and default areas without changing the previous state', () => {
    const oldArea = { areaName: 'FR', spilledEnergyCost: null, unsuppliedEnergyCost: null };
    const newArea = { ...oldArea, areaName: 'DE' };
    const prevState = {
      ...mockPrevStateArea(),
      areas: [oldArea],
      defaultAreas: [{ name: 'FR' }],
    };
    const payload = { areas: [newArea], defaultAreas: [{ name: 'DE' }] };

    const result = studyReducer(prevState, { type: STUDY_ACTION.SET_STUDY_AREAS, payload });

    expect(result).toEqual({ ...prevState, ...payload });
    expect(prevState.areas).toEqual([oldArea]);
    expect(prevState.defaultAreas).toEqual([{ name: 'FR' }]);
  });

  it('should clear study areas and default areas with empty lists', () => {
    const prevState = {
      ...mockPrevStateArea(),
      areas: [{ areaName: 'FR', spilledEnergyCost: null, unsuppliedEnergyCost: null }],
      defaultAreas: [{ name: 'FR' }],
    };

    const result = studyReducer(prevState, {
      type: STUDY_ACTION.SET_STUDY_AREAS,
      payload: { areas: [], defaultAreas: [] },
    });

    expect(result).toEqual({ ...prevState, areas: [], defaultAreas: [] });
  });

  it.each([true, false])('should set discardActionTriggered to %s and preserve unrelated data', (discardActionTriggered) => {
    const prevState = { ...mockPrevStateArea(), discardActionTriggered: !discardActionTriggered, hvdc: true };

    const result = studyReducer(prevState, {
      type: STUDY_ACTION.SKIP_MESSAGE,
      payload: { discardActionTriggered },
    });

    expect(result).toEqual({ ...prevState, discardActionTriggered });
    expect(prevState.discardActionTriggered).toBe(!discardActionTriggered);
  });

  it('should reset all study data to the initial status without mutating the previous state', () => {
    const prevState = {
      ...mockPrevStateArea(),
      studyStatus: StudyStatus.GENERATED,
      hvdc: true,
      discardActionTriggered: true,
      areas: [{ areaName: 'FR', spilledEnergyCost: null, unsuppliedEnergyCost: null }],
      defaultAreas: [{ name: 'FR' }],
    };

    const result = studyReducer(prevState, { type: STUDY_ACTION.RESET_STUDY_STATE });

    expect(result).toEqual({ studyStatus: StudyStatus.IN_PROGRESS });
    expect(prevState.studyStatus).toBe(StudyStatus.GENERATED);
    expect(prevState.AREA.trajectories).toHaveLength(1);
    expect(prevState.hvdc).toBe(true);
  });

  it('should handle SET_STUDY_STATUS action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.SET_STUDY_STATUS,
      payload: StudyStatus.GENERATED,
    };

    const result = studyReducer(mockPrevStateArea(), action);

    expect(result.studyStatus).toStrictEqual(StudyStatus.GENERATED);
    expect(result[TRAJECTORY_TYPE.AREA]?.trajectories).toStrictEqual([
      mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA'),
    ]);
  });

  it('should handle CLEAR_TRAJECTORY_BY_TYPE action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.AREA, TRAJECTORY_TYPE.LINK],
    };

    const result = studyReducer(mockPrevStateArea(), action);

    expect(result[TRAJECTORY_TYPE.AREA]?.trajectories).toHaveLength(0);
  });

  it('should handle ADD_TRAJECTORIES action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.ADD_TRAJECTORIES,
      payload: {
        [TRAJECTORY_TYPE.AREA]: {
          trajectories: [mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA')],
        },
      },
    };

    const result = studyReducer(mockPrevStateArea(), action);

    expect(result[TRAJECTORY_TYPE.AREA]?.trajectories).toHaveLength(1);
  });

  it('should handle DELETE_TRAJECTORY action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.DELETE_TRAJECTORY,
      payload: { area: 'ZoneA', type: TRAJECTORY_TYPE.LOAD },
    };

    const result = studyReducer(mockPrevStateLoad(), action);

    expect(result[TRAJECTORY_TYPE.LOAD]?.trajectories).toEqual([]);
  });

  it('should handle SKIP_MESSAGE action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.SKIP_MESSAGE,
      payload: {
        discardActionTriggered: true,
      },
    };
    const mockPrevState = () => ({
      studyStatus: StudyStatus.IN_PROGRESS,
      discardActionTriggered: false,
    });
    const result = studyReducer(mockPrevState(), action);
    expect(result?.discardActionTriggered).toBeTruthy();
  });

  it('should handles UPDATE_TRAJECTORY action', () => {
    const newTrajectory = mockDataBaseTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA');
    newTrajectory.trajectoryName = 'Updated';
    const action: StudyActionType = {
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: newTrajectory,
        status: 'success' as FileInputStatus,
      },
    };

    const result = studyReducer(mockPrevStateArea(), action);

    expect(result?.[TRAJECTORY_TYPE.AREA]?.trajectories?.[0]?.trajectoryName).toEqual('Updated');
  });

  it('should handles RESET_STUDY_STATE action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.RESET_STUDY_STATE,
    };

    const result = studyReducer(mockPrevStateArea(), action);

    expect(result?.[TRAJECTORY_TYPE.AREA]).toBeUndefined();
  });

  it('should return previous state when action is undefined', () => {
    const state = mockPrevStateArea();
    const result = studyReducer(state, undefined);

    expect(result).toEqual(state);
  });

  it('should return previous state on unknown action type', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as StudyActionType;
    const state = mockPrevStateArea();
    const result = studyReducer(state, action);

    expect(result).toEqual(state);
  });
});
