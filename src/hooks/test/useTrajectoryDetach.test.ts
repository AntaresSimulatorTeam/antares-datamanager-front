import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { DbTrajectory, RowStatus, StudyDTO, UserState } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { fetchWarningMessagesFromType } from '@/shared/services/warningService.ts';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';

vi.mock('@/shared/services/trajectoryService', () => ({
  unlinkTrajectoryFromStudy: vi.fn(),
}));

vi.mock('@/shared/services/warningService', () => ({
  fetchWarningMessagesFromType: vi.fn(),
}));

vi.mock('@/shared/services/hypothesisTableService', () => ({
  handleTrajectoryError: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn().mockImplementation((key: string) => key),
  }),
}));

vi.mock('@/store/contexts/UserContext', () => ({
  useUser: vi.fn(() => ({
    user: { profile: { sub: 'user-456' } },
  })),
}));

describe('useTrajectoryDetach', () => {
  const mockDispatch = vi.fn();
  const mockSetData = vi.fn();

  const study: StudyDTO = { id: 'study-001', name: 'Demo Study' } as unknown as StudyDTO;

  const trajectory = {
    id: 99,
    trajectoryName: 'Traj X',
    area: 'Zone X',
    type: TRAJECTORY_TYPE.LOAD,
  } as DbTrajectory;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should unlink trajectory when status is "empty" and update state', async () => {
    (fetchWarningMessagesFromType as Mock).mockResolvedValue(['warning']);

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [1], 'empty', trajectory);

    expect(unlinkTrajectoryFromStudy).toHaveBeenCalledWith(99, 'study-001');
    expect(fetchWarningMessagesFromType).toHaveBeenCalledWith(TRAJECTORY_TYPE.LOAD, 'study-001');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory,
        warningMessages: ['warning'],
        status: 'empty',
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should skip unlink if status is not "empty" but still update trajectory', async () => {
    (fetchWarningMessagesFromType as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [2], 'success', trajectory);

    expect(unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory,
        warningMessages: [],
        status: 'success',
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should handle error and call handleTrajectoryError when error is a business one', async () => {
    (unlinkTrajectoryFromStudy as Mock).mockRejectedValue({
      antaresErrorMessage: 'unlink failed',
      errorMessageArguments: ['args'],
      date: '2028-08-07T14:17:09.895028' as unknown as Date,
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'empty', trajectory);

    expect(handleTrajectoryError).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LOAD,
      [0],
      { id: 99, label: 'Traj X' },
      'Zone X',
      'user-456',
      mockSetData,
      expect.objectContaining({
        message: 'studyDetails.@notificationAlert',
        content: 'unlink failed',
      }),
    );
  });

  it('should not handle error and not call handleTrajectoryError when error is a technical one', async () => {
    (unlinkTrajectoryFromStudy as Mock).mockRejectedValue({
      antaresErrorMessage: 'unlink failed',
      errorMessageArguments: ['args'],
      date: '2028-08-07T14:17:09.895028' as unknown as Date,
      type: ERROR_MESSAGE_TYPE.TECHNICAL,
    });

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'empty', trajectory);

    expect(handleTrajectoryError).not.toHaveBeenCalled();
  });

  it('should not handle error and not call handleTrajectoryError when error is not a business one', async () => {
    (unlinkTrajectoryFromStudy as Mock).mockRejectedValue(new Error('unlink failed'));

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'empty', trajectory);

    expect(handleTrajectoryError).not.toHaveBeenCalled();
  });

  it('should handle error and call handleTrajectoryError with no user name', async () => {
    (unlinkTrajectoryFromStudy as Mock).mockRejectedValue({
      antaresErrorMessage: 'unlink failed',
      errorMessageArguments: ['args'],
      date: '2028-08-07T14:17:09.895028' as unknown as Date,
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });
    const mockUseUser = useUser as Mock<typeof useUser>;
    mockUseUser.mockImplementation(() => ({ user: { profile: {} } }) as UserState);

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'empty', trajectory);

    expect(handleTrajectoryError).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LOAD,
      [0],
      { id: 99, label: 'Traj X' },
      'Zone X',
      '',
      mockSetData,
      expect.objectContaining({
        message: 'studyDetails.@notificationAlert',
        content: 'unlink failed',
      }),
    );
  });

  it('should do nothing if trajectorySelected is null', async () => {
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [0], '' as RowStatus, {} as DbTrajectory);

    expect(unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockSetData).not.toHaveBeenCalled();
  });
});
