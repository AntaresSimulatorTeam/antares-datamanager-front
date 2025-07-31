import { mockWarningMessagesWithTwo } from '@/mocks/data/tests/warning.mock';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { Mock, vi } from 'vitest';
import { discardWarningMessage } from '@/shared/services/messagesWarningService.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning';
import { fetchWarningMessagesFromType, skipMessage } from '@/shared/services/warningService.ts';

vi.mock('@/shared/services/warningService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    skipMessage: vi.fn(),
    fetchWarningMessagesFromType: vi.fn().mockImplementation(() => Promise.resolve(mockWarningMessagesWithTwo)),
  };
});

vi.mock('@/store/contexts/StudyContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useStudyDispatch: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
  };
});

describe('discardWarningMessage', () => {
  const mockUseStudyDispatch = useStudyDispatch as Mock<typeof useStudyDispatch>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call authFetch with proper parameters', async () => {
    mockUseStudyDispatch.mockReturnValue(mockDispatch);
    await discardWarningMessage(105, TRAJECTORY_TYPE.LOAD, 122, mockDispatch);

    expect(skipMessage).toHaveBeenCalledWith(105);
    expect(fetchWarningMessagesFromType).toHaveBeenCalledWith(TRAJECTORY_TYPE.LOAD, 122);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.SKIP_MESSAGE,
      payload: { trajectoryType: TRAJECTORY_TYPE.LOAD, warningMessages: mockWarningMessagesWithTwo },
    });
  });

  it('should handle discard warning message failure gracefully', async () => {
    vi.mocked(fetchWarningMessagesFromType).mockRejectedValueOnce({
      antaresErrorMessage: 'Failed to discard warning message',
      date: new Date(),
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    await expect(async () => discardWarningMessage(105, TRAJECTORY_TYPE.LOAD, 122, mockDispatch)).rejects.toThrowError(
      'Failed to discard warning message',
    );
  });
});
