import { retrieveReadOnlyArea, sortByLevel } from '../trajectoryUtils';
import {
  defaultAreaNotInAreaTrajectoryList,
  rowData,
  rowDataTwo,
} from '@/shared/utils/tests/mocks/trajectoryUtilsMock.ts';
import { mockWarningMessages } from '@/shared/services/test/mocks/trajectoryMock.tsx';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/trajectory.ts';

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

describe('retrieveReadOnlyArea', () => {
  it('should return an object with the row index where a default area is not included in the areas option list', () => {
    const readOnlyRows = retrieveReadOnlyArea(rowData, defaultAreaNotInAreaTrajectoryList);
    expect(readOnlyRows).toStrictEqual({ '0': true, '2': true });
  });

  it('should return an empty object when all default areas are included in the areas option list', () => {
    const readOnlyRows = retrieveReadOnlyArea(rowData, []);
    expect(readOnlyRows).toStrictEqual({});
  });

  it('should return an empty object when all default areas are included in the areas option list', () => {
    const readOnlyRows = retrieveReadOnlyArea(rowDataTwo, defaultAreaNotInAreaTrajectoryList);
    expect(readOnlyRows).toStrictEqual({});
  });
});
