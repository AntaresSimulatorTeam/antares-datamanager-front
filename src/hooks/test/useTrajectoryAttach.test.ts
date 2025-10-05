import { describe, expect, it, Mock, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { DbTrajectory, StudyDTO, StudyState, UserState } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { mockSingleWarningMessages } from '@/mocks/data/tests/warning.mock.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';

vi.mock('@/shared/services/trajectoryService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    getStudyTrajectoriesWithWarnings: vi.fn(),
    linkTrajectoryToStudy: vi.fn(),
  };
});

vi.mock('@/shared/services/hypothesisTableService', () => ({
  handleTrajectoryError: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn().mockImplementation((key: string) => key),
  }),
}));

vi.mock('@/store/contexts/UserContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useUser: vi.fn(() => ({
      user: { profile: { sub: 'user-123' } },
    })),
  };
});

describe.skip('useTrajectoryAttach', () => {
  const mockDispatch = vi.fn();
  const mockSetData = vi.fn();

  const study: StudyDTO = { id: 'study-001', name: 'Demo Study' } as unknown as StudyDTO;

  const trajectory = {
    id: 42,
    trajectoryName: 'Traj A',
    area: 'Zone A',
    type: TRAJECTORY_TYPE.LOAD,
  } as DbTrajectory;

  const newTrajectory = {
    ...trajectory,
    id: 42,
  };

  const studyState: Partial<StudyState> = {
    [TRAJECTORY_TYPE.LOAD]: {
      trajectories: [{ area: 'Zone A' } as DbTrajectory],
      //warningMessages: [],
    },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update existing trajectory', async () => {
    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings as ReturnType<typeof vi.fn>).mockResolvedValue({
      trajectories: [newTrajectory],
      warningMessages: [mockSingleWarningMessages],
    });

    const { result } = renderHook(() => useTrajectoryAttach(study, studyState, mockDispatch, mockSetData));

    await result.current.attachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'success', trajectory);

    expect(trajectoryService.linkTrajectoryToStudy).toHaveBeenCalledWith(TRAJECTORY_TYPE.LOAD, 42, 'study-001');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: newTrajectory,
        warningMessages: [mockSingleWarningMessages],
        status: 'success',
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should add new trajectory if not already in state', async () => {
    const emptyState: Partial<StudyState> = {};

    vi.mocked(trajectoryService.getStudyTrajectoriesWithWarnings).mockResolvedValue({
      trajectories: [newTrajectory],
      warningMessages: [],
    });

    const { result } = renderHook(() => useTrajectoryAttach(study, emptyState, mockDispatch, mockSetData));

    await result.current.attachTrajectory(TRAJECTORY_TYPE.LOAD, [1], 'success', trajectory);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.ADD_TRAJECTORIES,
      payload: {
        [TRAJECTORY_TYPE.LOAD]: {
          trajectories: [newTrajectory],
          warningMessages: [],
        },
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should handle error and call handleTrajectoryError', async () => {
    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockRejectedValue(new Error('link failed'));

    const { result } = renderHook(() => useTrajectoryAttach(study, studyState, mockDispatch, mockSetData));

    await result.current.attachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'success', trajectory);

    expect(handleTrajectoryError).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LOAD,
      [0],
      { id: 42, label: 'Traj A' },
      'Zone A',
      'user-123',
      mockSetData,
      expect.objectContaining({
        message: 'studyDetails.@notificationAlert',
        content: 'link failed',
      }),
    );
  });

  it('should handle error and call handleTrajectoryError with no user name', async () => {
    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockRejectedValue(new Error('link failed'));
    const mockUseUser = useUser as Mock<typeof useUser>;
    mockUseUser.mockImplementation(() => ({ user: { profile: {} } }) as UserState);
    const { result } = renderHook(() => useTrajectoryAttach(study, studyState, mockDispatch, mockSetData));

    const trajectoryArea: DbTrajectory = {
      id: 100,
      trajectoryName: 'BP23_A_ref_v2',
      type: TRAJECTORY_TYPE.AREA,
      version: 1,
      userName: '',
      technology: '',
      creationDate: '2025-08-07T14:17:09.895028' as unknown as Date,
    };

    await result.current.attachTrajectory(TRAJECTORY_TYPE.AREA, [0], 'success', trajectoryArea);

    expect(handleTrajectoryError).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.AREA,
      [0],
      { id: 100, label: 'BP23_A_ref_v2' },
      '',
      '',
      mockSetData,
      expect.objectContaining({
        message: 'studyDetails.@notificationAlert',
        content: 'link failed',
      }),
    );
  });
});
