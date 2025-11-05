import { buildDataWarningMessage, convertDataToItem, countWarning, sortByLevel } from '@/shared/utils/warningUtils.ts';
import { WARNING_MESSAGE_LEVEL } from '@/shared/enum/warning.ts';
import { mockDataMessage, mockWarningMessages, mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { WarningTrajectoryType } from '@/shared/types';
import { skipMessage } from '@/shared/services/warningService.ts';

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
        trajectoryId: 105,
        trajectoryName: 'areas_BP23_A_ref',
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
        trajectoryId: 105,
        trajectoryName: 'areas_BP23_A_ref',
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
        trajectoryId: 105,
        trajectoryName: 'areas_BP23_A_ref',
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
        trajectoryId: 105,
        trajectoryName: 'areas_BP23_A_ref',
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
        trajectoryId: 105,
        trajectoryName: 'areas_BP23_A_ref',
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
        trajectoryId: 105,
        trajectoryName: 'areas_BP23_A_ref',
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
        trajectoryId: 105,
        trajectoryName: 'areas_BP23_A_ref',
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
        trajectoryId: 105,
        trajectoryName: 'areas_BP23_A_ref',
        secondTrajectory: 'links_BP23_A_ref',
        isAck: false,
      },
    ]);
  });
});

describe('convertDataToItem', () => {
  it('should return messages with title composed of the trajectory name and the secondary trajectory name', () => {
    const result = convertDataToItem(
      mockDataMessage,
      vi.fn().mockImplementation((key: string) => key),
    );

    expect(result).toEqual({
      code: '',
      colorStatus: 'warning',
      color: 'text-warning-500',
      colorBorder: 'hover:border-b-warning-500',
      icon: StdIconId.Warning,
      title: 'areas_BP23_A_ref - links_BP23_A_ref',
      buttonLabel: 'studyDetails.@skip',
      buttonTooltipText: 'studyDetails.@warningButtonTooltip',
      trajectoryId: 105,
      trajectoryType: 'LOAD',
      id: 1,
      content:
        'this is a warning message, after all, nothing change, just avoid violence. this is a warning message, after all, nothing change, just avoid violence',
      generatedBy: 'unknown_user',
      generatedAt: '2025-04-01T18:31:53.623683' as unknown as Date,
      isAck: false,
      onClickItem: null,
      studyId: 123,
    });
  });
});

describe('buildDataWarningMessage', () => {
  it('should return enriched messages when isNotGenerated is true', () => {
    const result = buildDataWarningMessage(mockWarningMessagesWithTwo, TRAJECTORY_TYPE.AREA, true, 123, skipMessage);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      ...mockWarningMessagesWithTwo[0],
      trajectoryType: TRAJECTORY_TYPE.AREA,
      onClickItem: skipMessage,
      studyId: 123,
    });
    expect(result[1].onClickItem).toBe(skipMessage);
  });

  it('should return messages with onClickItem set to null when isNotGenerated is false', () => {
    const result = buildDataWarningMessage(mockWarningMessagesWithTwo, TRAJECTORY_TYPE.LOAD, false, 123, skipMessage);

    expect(result.every((msg) => msg.onClickItem === null)).toBe(true);
  });

  it('should return empty array when messages is an empty array', () => {
    const result = buildDataWarningMessage([], TRAJECTORY_TYPE.AREA, true, 123, skipMessage);
    expect(result).toEqual([]);
  });
});

describe('countWarning', () => {
  it('returns correct count for AREA (sums AREA and LINK warnings)', () => {
    const warningNbByType = {
      AREA: 2,
    } as unknown as WarningTrajectoryType;
    expect(countWarning(warningNbByType, TRAJECTORY_TYPE.AREA)).toBe(2);
  });

  it('returns correct count for LINK only', () => {
    const warningNbByType = {
      AREA: 2,
      LINK: 1,
      THERMAL_CAPACITY: 0,
    } as unknown as WarningTrajectoryType;
    expect(countWarning(warningNbByType, TRAJECTORY_TYPE.AREA)).toBe(3);
  });

  it('returns correct count for THERMAL_CAPACITY only', () => {
    const warningNbByType = {
      AREA: 2,
      LINK: 1,
      THERMAL_CAPACITY: 0,
      THERMAL_TECHNICAL_SPECIFIC_PARAMETER: 2,
      THERMAL_TECHNICAL_MODULATION_PARAMETER: 1,
    } as unknown as WarningTrajectoryType;
    expect(countWarning(warningNbByType, TRAJECTORY_TYPE.THERMAL_CAPACITY)).toBe(3);
  });

  it('returns 0 when warningMessages is undefined', () => {
    const warningNbByType = {
      AREA: 2,
      LINK: 1,
      THERMAL_CAPACITY: 0,
    } as unknown as WarningTrajectoryType;
    expect(countWarning(warningNbByType, TRAJECTORY_TYPE.LOAD)).toBe(0);
  });
});
