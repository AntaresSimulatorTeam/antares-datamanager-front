import { skipTrajectoryMessage } from '@/store/reducers/studyReducer';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { DbTrajectory, WarningMessage } from '@/shared/types';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning';

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
    const messages: WarningMessage[] = [
      createMessage(1),
      createMessage(2),
      createMessage(3),
      createMessage(4),
    ];

    const trajectory: DbTrajectory = {
      id: 20,
      messages,
    } as DbTrajectory;

    const prevState = {
      [TRAJECTORY_TYPE.AREA]: [trajectory],
    };

    const payload = {
      id: 2,               // skip message with id 2
      trajectoryType: TRAJECTORY_TYPE.AREA,
      trajectoryId: 20,
    };

    const newState = skipTrajectoryMessage(prevState, payload);

    const newMessages = newState[TRAJECTORY_TYPE.AREA]?.[0]?.messages;

    expect(newMessages).toHaveLength(4);


    expect(newMessages?.[3].id).toBe(2);
    expect(newMessages?.[3].isAck).toBe(true);


    expect(newMessages?.slice(0, 3).map(m => m.id)).toEqual([1, 3, 4]);
  })

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
