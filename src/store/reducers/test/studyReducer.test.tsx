import {
  addTrajectories,
  clearByType,
  deleteTrajectory,
  skipTrajectoryMessage,
  studyReducer,
  updateTrajectory,
} from '@/store/reducers/studyReducer';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { DbTrajectory, FileInputStatus, StudyActionType, StudyState, WarningMessage } from '@/shared/types';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { describe, expect, it } from 'vitest';
import { mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';

const mockTrajectory = (type: TRAJECTORY_TYPE, id: number, area: string): DbTrajectory => ({
  id,
  type,
  trajectoryName: `${type}-name`,
  version: 1,
  userName: 'CB',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  loadArea: area,
  messages: mockWarningMessagesWithTwo,
});

describe('addTrajectories', () => {
  it('should add new trajectories to empty state', () => {
    const trajectory = mockTrajectory(TRAJECTORY_TYPE.AREA, 67, 'AT');

    const result = addTrajectories({}, [trajectory]);

    expect(result[TRAJECTORY_TYPE.AREA]).toEqual([trajectory]);
  });

  it('should merge with existing trajectories and deduplicate', () => {
    const existingTraj = mockTrajectory(TRAJECTORY_TYPE.AREA, 56, 'AT');
    const newTraj = mockTrajectory(TRAJECTORY_TYPE.AREA, 90, 'FR');

    const prevState = {
      [TRAJECTORY_TYPE.AREA]: [existingTraj],
    };

    const result = addTrajectories(prevState, [existingTraj, newTraj]);

    expect(result[TRAJECTORY_TYPE.AREA]).toContainEqual(existingTraj);
    expect(result[TRAJECTORY_TYPE.AREA]).toContainEqual(newTraj);
    expect(result[TRAJECTORY_TYPE.AREA]).toHaveLength(2);
  });

  it('should preserve unrelated trajectory types', () => {
    const prevState = {
      LINK: [
        {
          id: 56,
          type: TRAJECTORY_TYPE.LINK,
          trajectoryName: 'Link-Trajectory',
          version: 1,
          userName: 'CF',
          creationDate: '2025' as unknown as Date,
          loadArea: 'CZ',
        },
      ],
    };
    const areaTraj = mockTrajectory(TRAJECTORY_TYPE.AREA, 56, 'CZ');

    const result = addTrajectories(prevState, [areaTraj]);

    expect(result['LINK']).toEqual(prevState['LINK']);
    expect(result[TRAJECTORY_TYPE.AREA]).toEqual([areaTraj]);
  });

  it('should handle multiple types in one call', () => {
    const areaTraj = mockTrajectory(TRAJECTORY_TYPE.AREA, 45, 'FR');
    const linkTraj = mockTrajectory(TRAJECTORY_TYPE.LINK, 23, 'DA');

    const result = addTrajectories({}, [areaTraj, linkTraj]);

    expect(result[TRAJECTORY_TYPE.AREA]).toEqual([areaTraj]);
    expect(result[TRAJECTORY_TYPE.LINK]).toEqual([linkTraj]);
  });
});

describe('deleteTrajectory', () => {
  const trajectorySample = mockTrajectory(TRAJECTORY_TYPE.AREA, 123, 'zoneA');

  it('should removes the specified trajectory from the correct type array', () => {
    const prevState = {
      [TRAJECTORY_TYPE.AREA]: [trajectorySample],
    };
    const payload = { area: 'zoneA', type: TRAJECTORY_TYPE.AREA };
    const result = deleteTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.AREA]).toEqual([]);
  });

  it('should returns the same state if no matching trajectory is found', () => {
    const prevState = {
      studyState: StudyStatus.IN_PROGRESS,
      [TRAJECTORY_TYPE.AREA]: [mockTrajectory(TRAJECTORY_TYPE.AREA, 456, 'ZoneB')],
    };
    const payload = { area: 'ZoneA', type: TRAJECTORY_TYPE.AREA };
    const result = deleteTrajectory(prevState, payload);

    expect(result).toEqual(prevState);
  });

  it('should returns the same state if the trajectory list is null', () => {
    const prevState = {
      studyState: StudyStatus.IN_PROGRESS,
      [TRAJECTORY_TYPE.AREA]: null,
    };

    const payload = { area: 'ZoneA', type: TRAJECTORY_TYPE.AREA };

    const result = deleteTrajectory(prevState, payload);

    expect(result).toEqual(prevState);
  });

  it('should returns the same state if the trajectory list is missing', () => {
    const prevState = {};
    const payload = { area: 'ZoneA', type: TRAJECTORY_TYPE.AREA };

    const result = deleteTrajectory(prevState, payload);

    expect(result).toEqual(prevState);
  });

  it('should not mutate the original state object', () => {
    const prevState = {
      [TRAJECTORY_TYPE.AREA]: [{ ...trajectorySample }],
    };
    const payload = { area: 'ZoneA', type: TRAJECTORY_TYPE.AREA };
    const result = deleteTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.AREA]).not.toBe(prevState[TRAJECTORY_TYPE.AREA]);
  });
});

describe('skipTrajectoryMessage', () => {
  const createMessage = (id: number, isAck = false): WarningMessage => ({
    id,
    content: `Test message ${id}`,
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: `CODE_${id}`,
    generatedBy: 'System',
    generatedAt: new Date(`2024-01-0${id}T12:00:00Z`),
    trajectory: 'Trajectory A',
    secondTrajectory: 'Trajectory B',
    isAck,
  });

  it('should mark a message as acknowledged and moves it to the end with 4 messages', () => {
    const messages: WarningMessage[] = [createMessage(1), createMessage(2), createMessage(3), createMessage(4)];

    const trajectory: DbTrajectory = {
      id: 20,
      messages,
    } as DbTrajectory;

    const prevState = {
      [TRAJECTORY_TYPE.AREA]: [trajectory],
    };

    const payload = {
      id: 2, // skip message with id 2
      trajectoryType: TRAJECTORY_TYPE.AREA,
      trajectoryId: 20,
    };

    const newState = skipTrajectoryMessage(prevState, payload);

    const newMessages = newState[TRAJECTORY_TYPE.AREA]?.[0]?.messages;

    expect(newMessages).toHaveLength(4);

    expect(newMessages?.[3].id).toBe(2);
    expect(newMessages?.[3].isAck).toBe(true);

    expect(newMessages?.slice(0, 3).map((m) => m.id)).toEqual([1, 3, 4]);
  });

  it('should return original state if message ID is not found', () => {
    const messages: WarningMessage[] = [createMessage(1)];

    const trajectory: DbTrajectory = {
      id: 5,
      messages,
    } as DbTrajectory;

    const prevState = {
      [TRAJECTORY_TYPE.LINK]: [trajectory],
    };

    const newState = skipTrajectoryMessage(prevState, {
      id: 999, // not found
      trajectoryType: TRAJECTORY_TYPE.LINK,
      trajectoryId: 5,
    });

    expect(newState).toEqual(prevState);
  });

  it('should set messages to an empty array when no messages', () => {
    const trajectory = {
      id: 5,
      messages: null,
    } as unknown as DbTrajectory;

    const prevState = {
      [TRAJECTORY_TYPE.LINK]: [trajectory],
    };

    const newState = skipTrajectoryMessage(prevState, {
      id: 5,
      trajectoryType: TRAJECTORY_TYPE.LINK,
      trajectoryId: 5,
    });

    expect(newState).toEqual(prevState);
  });

  it('should return original state if trajectories list is not an array', () => {
    const prevState = {
      [TRAJECTORY_TYPE.LINK]: undefined,
    };

    const newState = skipTrajectoryMessage(prevState, {
      id: 999,
      trajectoryType: TRAJECTORY_TYPE.LINK,
      trajectoryId: 5,
    });

    expect(newState).toEqual(prevState);
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
    AREA: [mockTrajectory(TRAJECTORY_TYPE.AREA, 123, 'zoneA')],
    LINK: [mockTrajectory(TRAJECTORY_TYPE.LINK, 567, 'zoneB')],
    LOAD: [mockTrajectory(TRAJECTORY_TYPE.LOAD, 987, 'zoneC')],
  };

  it('should clears matching trajectory types by setting them to null', () => {
    const payload = [TRAJECTORY_TYPE.AREA, TRAJECTORY_TYPE.LOAD];
    const result = clearByType(prevState, payload);

    expect(result).toEqual({
      studyStatus: StudyStatus.IN_PROGRESS,
      AREA: null,
      LINK: [mockTrajectory(TRAJECTORY_TYPE.LINK, 567, 'zoneB')],
      LOAD: null,
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
    expect(result[TRAJECTORY_TYPE.AREA]).toBeNull();
  });
});

describe('updateTrajectory', () => {
  const baseTrajectory: DbTrajectory = mockTrajectory(TRAJECTORY_TYPE.LINK, 123, 'ZoneA');

  const prevState: Partial<StudyState> = {
    studyStatus: StudyStatus.IN_PROGRESS,
    [TRAJECTORY_TYPE.LINK]: [baseTrajectory],
  };

  it('should update trajectory when status is success', () => {
    const updatedTrajectory: DbTrajectory = {
      ...baseTrajectory,
      trajectoryName: 'Updated',
      messages: mockWarningMessagesWithTwo,
    };

    const payload = {
      trajectory: updatedTrajectory,
      status: 'success' as FileInputStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.LINK]?.[0].trajectoryName).toBe('Updated');
    expect(result[TRAJECTORY_TYPE.LINK]?.[0].messages).toEqual(mockWarningMessagesWithTwo);
  });

  it('should clear trajectory fields when status is not success', () => {
    const updatedTrajectory = {
      ...baseTrajectory,
      trajectoryName: 'Updated',
      messages: mockWarningMessagesWithTwo,
    };

    const payload = {
      trajectory: updatedTrajectory,
      status: 'error' as FileInputStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.LINK]?.[0].trajectoryName).toBe('');
    expect(result[TRAJECTORY_TYPE.LINK]?.[0].messages).toEqual([]);
  });

  it('should return original state if no matching trajectory is found', () => {
    const payload = {
      trajectory: {
        ...baseTrajectory,
        loadArea: 'NonMatchingZone',
      },
      status: 'success' as FileInputStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result).toEqual(prevState);
  });

  it('should return original state if trajectory list is null', () => {
    const nullState: Partial<StudyState> = {
      [TRAJECTORY_TYPE.LINK]: null,
    };

    const payload = {
      trajectory: baseTrajectory,
      status: 'success' as FileInputStatus,
    };

    const result = updateTrajectory(nullState, payload);

    expect(result).toEqual(nullState);
  });

  it('should not mutate original state', () => {
    const payload = {
      trajectory: {
        ...baseTrajectory,
        trajectoryName: 'Changed',
        messages: mockWarningMessagesWithTwo,
      },
      status: 'success' as FileInputStatus,
    };

    const result = updateTrajectory(prevState, payload);

    expect(result[TRAJECTORY_TYPE.LINK]).not.toBe(prevState[TRAJECTORY_TYPE.LINK]);
  });
});

// Mock handlers to isolate reducer logic
vi.mock('./studyReducer.tsx', () => ({
  clearByType: vi.fn(() => ({ cleared: true })),
  addTrajectories: vi.fn(() => ({ added: true })),
  deleteTrajectory: vi.fn(() => ({ deleted: true })),
  updateTrajectory: vi.fn(() => ({ updated: true })),
  skipTrajectoryMessage: vi.fn(() => ({ skipped: true })),
}));

describe('studyReducer', () => {
  const prevState = {
    studyStatus: StudyStatus.IN_PROGRESS,
    [TRAJECTORY_TYPE.AREA]: [mockTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA')],
  };

  it('should handle SET_STUDY_STATUS action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.SET_STUDY_STATUS,
      payload: StudyStatus.GENERATED,
    };

    const result = studyReducer(prevState, action);

    expect(result.studyStatus).toStrictEqual(StudyStatus.GENERATED);
    expect(result[TRAJECTORY_TYPE.AREA]).toStrictEqual([mockTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA')]);
  });

  it('should handle CLEAR_TRAJECTORY_BY_TYPE action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.AREA, TRAJECTORY_TYPE.LINK],
    };

    const result = studyReducer(prevState, action);

    expect(result[TRAJECTORY_TYPE.AREA]).toBeNull();
  });

  it('should handle ADD_TRAJECTORIES action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.ADD_TRAJECTORIES,
      payload: [mockTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA')],
    };

    const result = studyReducer(prevState, action);

    expect(result[TRAJECTORY_TYPE.AREA]).toHaveLength(1);
  });

  it('should handle DELETE_TRAJECTORY action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.DELETE_TRAJECTORY,
      payload: { area: 'ZoneA', type: TRAJECTORY_TYPE.AREA },
    };

    const result = studyReducer(prevState, action);

    expect(result[TRAJECTORY_TYPE.AREA]).toEqual([]);
  });

  it('should handles UPDATE_TRAJECTORY action', () => {
    const newTrajectory = mockTrajectory(TRAJECTORY_TYPE.AREA, 123, 'ZoneA');
    newTrajectory.trajectoryName = 'Updated';
    const action: StudyActionType = {
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: newTrajectory,
        status: 'success' as FileInputStatus,
      },
    };

    const result = studyReducer(prevState, action);

    expect(result?.[TRAJECTORY_TYPE.AREA]?.[0]?.trajectoryName).toEqual('Updated');
  });

  it('should handle SKIP_MESSAGE action', () => {
    const action: StudyActionType = {
      type: STUDY_ACTION.SKIP_MESSAGE,
      payload: { trajectoryType: TRAJECTORY_TYPE.AREA, id: 1, trajectoryId: 123 },
    };

    const result = studyReducer(prevState, action);

    expect(result?.[TRAJECTORY_TYPE.AREA]?.[0]?.messages?.[1].isAck).toBeTruthy();
  });

  it('should return previous state when action is undefined', () => {
    const result = studyReducer(prevState, undefined);

    expect(result).toEqual(prevState);
  });

  it('should return previous state on unknown action type', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as StudyActionType;

    const result = studyReducer(prevState, action);

    expect(result).toEqual(prevState);
  });
});
