import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { getWarningMessages } from '@/shared/helpers/warningMessagesHelper.ts';
import { buildDataWarningMessage } from '@/shared/utils/warningUtils.ts';
import { mockDataMessage, mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock.ts';
import { vi } from 'vitest';

vi.mock('@/shared/utils/warningUtils', () => ({
  buildDataWarningMessage: vi.fn(),
}));

describe('getWarningMessages', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('handles AREA tab and merges LINK warnings', () => {
    const state = {
      AREA: { trajectories: [], warningMessages: [mockWarningMessagesWithTwo[0]] },
      LINK: { trajectories: [], warningMessages: mockWarningMessagesWithTwo },
      studyStatus: StudyStatus.IN_PROGRESS,
    };
    vi.mocked(buildDataWarningMessage).mockReturnValue([mockDataMessage, mockDataMessage, mockDataMessage]);
    const result = getWarningMessages(state, TRAJECTORY_TYPE.AREA, 123);
    expect(buildDataWarningMessage).toHaveBeenCalledWith(
      [mockWarningMessagesWithTwo[0]].concat(mockWarningMessagesWithTwo),
      TRAJECTORY_TYPE.AREA,
      true,
      123,
    );
    expect(result.length).toBe(3);
  });

  it('handles non-AREA tab without merging LINK', () => {
    const state = {
      LOAD: { trajectories: [], warningMessages: [mockWarningMessagesWithTwo[0]] },
      studyStatus: StudyStatus.GENERATED,
    };
    vi.mocked(buildDataWarningMessage).mockReturnValue([mockDataMessage]);
    const result = getWarningMessages(state, TRAJECTORY_TYPE.LOAD, 456);
    expect(buildDataWarningMessage).toHaveBeenCalledWith(
      [mockWarningMessagesWithTwo[0]],
      TRAJECTORY_TYPE.LOAD,
      false,
      456,
    );
    expect(result.length).toBe(1);
  });

  it('returns empty array if warnings undefined', () => {
    const state = {
      AREA: { trajectories: [], warningMessages: [] },
      LINK: { trajectories: [], warningMessages: [] },
      studyStatus: StudyStatus.GENERATED,
    };
    vi.mocked(buildDataWarningMessage).mockReturnValue([]);
    const result = getWarningMessages(state, TRAJECTORY_TYPE.AREA, 789);
    expect(result.length).toBe(0);
    expect(buildDataWarningMessage).toHaveBeenCalledWith([], TRAJECTORY_TYPE.AREA, false, 789);
  });
});
