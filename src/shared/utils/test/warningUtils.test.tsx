import { buildDataWarningMessage, sortByLevel } from '@/shared/utils/warningUtils.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { mockWarningMessages, mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock.ts';
import { discardWarningMessage } from '@/shared/services/warningService.ts';
import { DbTrajectory } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

describe('sortByLevel', () => {
  it('should sort messages according to the level priority', () => {
    const sortedMessages = mockWarningMessages.sort(sortByLevel);
    expect(sortedMessages).toStrictEqual([
      {
        id: 3,
        content: 'this is an error message',
        level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
        code: 'LINKS_AREA_NOT_PRESENT',
        generatedBy: 'unknown_user',
        generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
        trajectory: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
      {
        id: 7,
        content: 'this is an error message',
        level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
        code: 'LINKS_AREA_NOT_PRESENT',
        generatedBy: 'unknown_user',
        generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
        trajectory: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
      {
        id: 1,
        content:
          'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
        level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
        code: 'LINKS_AREA_NOT_PRESENT',
        generatedBy: 'unknown_user',
        generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
        trajectory: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
      {
        id: 2,
        content: 'this is a warning message',
        level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
        code: 'LINKS_AREA_NOT_PRESENT',
        generatedBy: 'unknown_user',
        generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
        trajectory: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
      {
        id: 4,
        content: 'this is a warning message',
        level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
        code: 'LINKS_AREA_NOT_PRESENT',
        generatedBy: 'unknown_user',
        generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
        trajectory: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
      {
        id: 5,
        content:
          'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
        level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
        code: 'LINKS_AREA_NOT_PRESENT',
        generatedBy: 'unknown_user',
        generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
        trajectory: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
      {
        id: 6,
        content: 'this is a warning message',
        level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
        code: 'LINKS_AREA_NOT_PRESENT',
        generatedBy: 'unknown_user',
        generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
        trajectory: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
      {
        id: 8,
        content: 'this is a warning message',
        level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
        code: 'LINKS_AREA_NOT_PRESENT',
        generatedBy: 'unknown_user',
        generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
        trajectory: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
    ]);
  });
});

describe('buildDataWarningMessage', () => {
  const mockTrajectory: DbTrajectory =
    {
      id: 123,
      trajectoryName: 'T-Alpha',
      type: TRAJECTORY_TYPE.AREA,
      version: 1,
      userName: 'CB',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: mockWarningMessagesWithTwo
    }

  it('should return enriched messages when isNotGenerated is true', () => {
    const result = buildDataWarningMessage(mockTrajectory, TRAJECTORY_TYPE.AREA, true);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      ...mockWarningMessagesWithTwo[0],
      trajectoryId: 123,
      trajectoryType: TRAJECTORY_TYPE.AREA,
      trajectory: 'T-Alpha',
      onClickItem: discardWarningMessage,
    });
    expect(result[1].onClickItem).toBe(discardWarningMessage);
  });

  it('should return messages with onClickItem set to null when isNotGenerated is false', () => {
    const result = buildDataWarningMessage(mockTrajectory, TRAJECTORY_TYPE.LOAD, false);

    expect(result.every((msg) => msg.onClickItem === null)).toBe(true);
  });

  it('should return empty array when trajectory.messages is undefined', () => {
    const emptyTrajectory = {
      id: 123,
      trajectoryName: 'T-Alpha',
      type: TRAJECTORY_TYPE.AREA,
      version: 1,
      userName: 'CB',
      creationDate: '2024-07-22 15:13:56.860045' as unknown as Date,
      messages: [],
    };

    const result = buildDataWarningMessage(emptyTrajectory, TRAJECTORY_TYPE.AREA, true);
    expect(result).toEqual([]);
  });
});
