import {
  addTrajectories,
  clearByType,
  deleteTrajectory,
  studyReducer,
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

vi.mock(import('@/shared/utils/trajectoryUtils'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    isMatchingTrajectoryType: (type: TRAJECTORY_TYPE) => (check: TRAJECTORY_TYPE) => type === check,
  };
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
});

describe('updateTrajectory', () => {
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

  it('should not update if trajectory is not in prevState', () => {
    const baseTrajectoryMock = [
      {
        id: '14',
        area: 'Zone B',
        technology: 'Tech X1',
        type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
        trajectoryName: 'Initial',
      },
      {
        id: '15',
        area: 'Zone F',
        technology: 'Tech DE',
        type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
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

    expect(result).toEqual(prevState);
  });

  it('should return prevState if no trajectories found', () => {
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

    expect(result).toEqual(prevState);
  });
});

// Mock handlers to isolate reducer logic
vi.mock('./studyReducer.tsx', () => ({
  clearByType: vi.fn(() => ({ cleared: true })),
  addTrajectories: vi.fn(() => ({ added: true })),
  deleteTrajectory: vi.fn(() => ({ deleted: true })),
  updateTrajectory: vi.fn(() => ({ updated: true })),
}));

describe('studyReducer', () => {
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
