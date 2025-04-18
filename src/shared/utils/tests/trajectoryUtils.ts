import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';
import { sortByLevel } from '@/shared/utils/trajectoryUtils.ts';
import { mockWarningMessages } from '@/shared/services/test/mocks/trajectoryMock.tsx';

describe('sortByLevel', () => {
  it('should sort messages according to the level priority', () => {
    const sortedMessages = mockWarningMessages.sort(sortByLevel);
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
