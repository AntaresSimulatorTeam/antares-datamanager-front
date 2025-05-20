import { mockWarningMessages } from '@/shared/services/test/mocks/trajectoryMock.tsx';
import { sortByLevel } from '@/shared/utils/warningUtils.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';

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
