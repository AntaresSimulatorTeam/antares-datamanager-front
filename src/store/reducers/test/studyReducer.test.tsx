import { addTrajectories, clearByType, deleteTrajectory, skipTrajectoryMessage } from '@/store/reducers/studyReducer';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { DbTrajectory, WarningMessage } from '@/shared/types';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { describe, expect, it } from 'vitest';

const mockTrajectory = (type: TRAJECTORY_TYPE, id: number, area: string): DbTrajectory => ({
  id,
  type,
  trajectoryName: `${type}-name`,
  version: 1,
  userName: 'CB',
  creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
  loadArea: area,
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

  it('marks a message as acknowledged and moves it to the end with 4 messages', () => {
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

  it('returns original state if message ID is not found', () => {
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
