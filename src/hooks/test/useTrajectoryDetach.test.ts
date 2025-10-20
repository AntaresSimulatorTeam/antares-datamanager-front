import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { DbTrajectory, RowStatus, StudyDTO, UserState } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach.ts';
import { unlinkMultipleTrajectoriesFromStudy, unlinkTrajectoryFromStudy } from '@/shared/services/trajectoryService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { notifyAlert } from '@/shared/notification/notification.tsx';

vi.mock('@/shared/services/trajectoryService', () => ({
  unlinkTrajectoryFromStudy: vi.fn(),
  unlinkMultipleTrajectoriesFromStudy: vi.fn(),
}));

vi.mock('@/shared/notification/notification', () => ({
  notifyAlert: vi.fn(),
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

  const trajectorySpecific = {
    id: 998,
    trajectoryName: 'BE',
    area: 'Zone X',
    type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
  } as DbTrajectory;

  const trajectoryParam = {
    id: 20,
    trajectoryName: 'param_2026',
    area: 'Zone X',
    type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
  } as DbTrajectory;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should unlink trajectory when status is "empty" and update state', async () => {
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [1], 'empty', trajectory);

    expect(unlinkTrajectoryFromStudy).toHaveBeenCalledWith(99, 'study-001');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory,
        status: 'empty',
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should skip unlink if status is not "empty" but still update trajectory', async () => {
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [2], 'success', trajectory);

    expect(unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory,
        status: 'success',
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should handle multiple detach if additionalTrajectory is provided and trajectory type is THERMAL_TECHNICAL_SPECIFIC_PARAMETER', async () => {
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      [0],
      'empty' as RowStatus,
      trajectorySpecific,
      trajectoryParam,
    );

    expect(unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
    expect(unlinkMultipleTrajectoriesFromStudy).toHaveBeenCalledWith('study-001', [998, 20]);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: { trajectory: trajectorySpecific, status: 'empty' },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should notify error within notification alert for multiple deletion', async () => {
    (unlinkMultipleTrajectoriesFromStudy as Mock).mockRejectedValue(new Error('unlink failed'));

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      [0],
      'empty' as RowStatus,
      trajectorySpecific,
      trajectoryParam,
    );

    expect(notifyAlert).toHaveBeenCalled();
  });

  it('should handle error and call handleTrajectoryError when error is a business one', async () => {
    (unlinkTrajectoryFromStudy as Mock).mockRejectedValue(new Error('unlink failed'));

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
    (unlinkTrajectoryFromStudy as Mock).mockRejectedValue(new Error('unlink failed'));

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'empty', trajectory);

    expect(handleTrajectoryError).toHaveBeenCalled();
  });

  it('should not handle error and not call handleTrajectoryError when error is not a business one', async () => {
    (unlinkTrajectoryFromStudy as Mock).mockRejectedValue(new Error('unlink failed'));

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'empty', trajectory);

    expect(handleTrajectoryError).toHaveBeenCalled();
  });

  it('should notify error with an alert when multiple unlink failed', async () => {
    (unlinkMultipleTrajectoriesFromStudy as Mock).mockRejectedValue(new Error('unlink failed'));

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch, mockSetData));

    await result.current.detachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'empty', trajectory, trajectoryParam);

    expect(handleTrajectoryError).not.toHaveBeenCalled();
    expect(notifyAlert).toHaveBeenCalled();
  });

  it('should handle error and call handleTrajectoryError with no user name', async () => {
    (unlinkTrajectoryFromStudy as Mock).mockRejectedValue(new Error('unlink failed'));
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
