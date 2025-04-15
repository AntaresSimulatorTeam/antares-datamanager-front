import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import { WarningMessage } from '@/shared/types';
import { sortByLevel } from '@/shared/utils/trajectoryUtils.ts';

const mockMessages: WarningMessage[] = [
  {
    id: 1,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 2,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 3,
    content: 'this is an error message',
    level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
  {
    id: 4,
    content: 'this is a warning message',
    level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
    code: 'LINKS_AREA_NOT_PRESENT',
    generatedBy: 'unknown_user',
    generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
    secondTrajectory: 'links_BP23_A_ref',
  },
];

describe('sortByLevel', () => {
  it('should sort messages according to the level priority', () => {
    const sortedMessages = mockMessages.sort(sortByLevel);
    expect(sortedMessages).toBe([
      {
        id: 3,
        content: 'this is an error message',
        level: WARNING_MESSAGE_LEVEL.ERROR_LEVEL,
      },
      {
        id: 1,
        content: 'this is a warning message',
        level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
      },
      {
        id: 4,
        content: 'this is a warning message',
        level: WARNING_MESSAGE_LEVEL.WARNING_LEVEL,
      },
      {
        id: 2,
        content: 'this is a warning message',
        level: WARNING_MESSAGE_LEVEL.INFO_LEVEL,
      },
    ]);
  });
});
