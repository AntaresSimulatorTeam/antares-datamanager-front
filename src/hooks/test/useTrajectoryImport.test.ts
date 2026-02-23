import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { uploadTrajectory } from '@/shared/services/trajectoryService.ts';
import { useTrajectoryImport } from '@/hooks/useTrajectoryImport.ts';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { HypothesisRowData, StudyDTO, UserState } from '@/shared/types';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { ERROR_MESSAGE_TYPE } from '@/shared/enum/warning.ts';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';

vi.mock('@/shared/services/trajectoryService', () => ({
  uploadTrajectory: vi.fn(),
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
    user: { profile: { sub: 'user-123' } },
  })),
}));

vi.mock('@/hooks/useTrajectoryAttach', () => ({
  useTrajectoryAttach: () => ({
    attachTrajectory: vi.fn(),
  }),
}));

describe('useTrajectoryImport', () => {
  const mockDispatch = vi.fn();
  const mockSetData = vi.fn();
  const mockSetReadOnly = vi.fn();

  const study = {
    id: 'study-001',
    name: 'Test Study',
    horizon: 2030,
  } as unknown as StudyDTO;

  const studyState = {};

  const value = { id: 12, label: 'Trajectory A' };

  const data = [
    {
      hypothesis: 'Solar',
      subRows: [{ hypothesis: 'Tech A' }],
    },
  ] as HypothesisRowData[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should import AREA trajectory and call readOnly method', async () => {
    const mockTrajectory = { id: 101, trajectoryName: 'Trajectory A' };
    (uploadTrajectory as Mock).mockResolvedValue(mockTrajectory);

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch, mockSetReadOnly));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.AREA, value, [0, 0], data, mockSetData);
    });

    expect(uploadTrajectory).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.AREA,
      'Trajectory A',
      2030,
      'study-001',
      'Solar',
      expect.any(Function),
      false,
      'Tech A',
    );

    expect(result.current.fileStatus).toBe('success');
    expect(result.current.progress).toBeGreaterThanOrEqual(0);
    expect(mockSetReadOnly).toHaveBeenCalled();
  });

  it('should import LINK trajectory and not call setReadOnly', async () => {
    const mockTrajectory = { id: 101, trajectoryName: 'Trajectory A' };
    (uploadTrajectory as Mock).mockResolvedValue(mockTrajectory);

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch, mockSetReadOnly));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.LINK, value, [0, 0], data, mockSetData);
    });

    expect(uploadTrajectory).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LINK,
      'Trajectory A',
      2030,
      'study-001',
      'Solar',
      expect.any(Function),
      false,
      'Tech A',
    );

    expect(mockSetReadOnly).not.toHaveBeenCalled();
  });

  it('should import trajectory and call attachTrajectory', async () => {
    const mockTrajectory = { id: 101, trajectoryName: 'Trajectory A' };
    (uploadTrajectory as Mock).mockResolvedValue(mockTrajectory);

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.LOAD, value, [0, 0], data, mockSetData);
    });

    expect(uploadTrajectory).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LOAD,
      'Trajectory A',
      2030,
      'study-001',
      'Solar',
      expect.any(Function),
      false,
      'Tech A',
    );

    expect(result.current.fileStatus).toBe('success');
    expect(result.current.progress).toBeGreaterThanOrEqual(0);
  });

  it('should import trajectory and call attachTrajectory', async () => {
    const mockTrajectory = { id: 101, trajectoryName: 'Trajectory A' };
    (uploadTrajectory as Mock).mockResolvedValue(mockTrajectory);

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.STS, value, [0, 0], data, mockSetData);
    });

    expect(uploadTrajectory).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.STS,
      'Trajectory A',
      2030,
      'study-001',
      'Solar',
      expect.any(Function),
      false,
      'Tech A',
    );

    expect(result.current.fileStatus).toBe('success');
    expect(result.current.progress).toBeGreaterThanOrEqual(0);
  });

  it('should import trajectory and call attachTrajectory', async () => {
    const mockTrajectory = { id: 101, trajectoryName: 'Trajectory A' };
    (uploadTrajectory as Mock).mockResolvedValue(mockTrajectory);

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.STS, value, [0, 0], data, mockSetData);
    });

    expect(uploadTrajectory).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.STS,
      'Trajectory A',
      2030,
      'study-001',
      'Solar',
      expect.any(Function),
      false,
      'Tech A',
    );

    expect(result.current.fileStatus).toBe('success');
    expect(result.current.progress).toBeGreaterThanOrEqual(0);
  });

  it('should handle error and call handleTrajectoryError', async () => {
    (uploadTrajectory as Mock).mockRejectedValue({
      antaresErrorMessage: 'upload failed',
      errorMessageArguments: ['args'],
      date: '2028-08-07T14:17:09.895028' as unknown as Date,
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.LOAD, value, [0], data, mockSetData);
    });

    expect(result.current.fileStatus).toBe('error');
    expect(handleTrajectoryError).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LOAD,
      [0],
      { id: 12, label: 'Trajectory A' },
      'Solar',
      'user-123',
      mockSetData,
      expect.objectContaining({
        message: 'studyDetails.@notificationAlert',
        content: 'upload failed',
      }),
    );
  });
  it('should handle error and call handleTrajectoryError with no user name', async () => {
    (uploadTrajectory as Mock).mockRejectedValue({
      antaresErrorMessage: 'upload failed',
      errorMessageArguments: ['args'],
      date: '2028-08-07T14:17:09.895028' as unknown as Date,
      type: ERROR_MESSAGE_TYPE.BUSINESS,
    });
    const mockUseUser = useUser as Mock<typeof useUser>;
    mockUseUser.mockImplementation(() => ({ user: { profile: {} } }) as UserState);

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.LOAD, value, [0], data, mockSetData);
    });

    expect(result.current.fileStatus).toBe('error');
    expect(handleTrajectoryError).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LOAD,
      [0],
      { id: 12, label: 'Trajectory A' },
      'Solar',
      '',
      mockSetData,
      expect.objectContaining({
        message: 'studyDetails.@notificationAlert',
        content: 'upload failed',
      }),
    );
  });

  it('should not handle error and not call handleTrajectoryError when error is a technical one', async () => {
    (uploadTrajectory as Mock).mockRejectedValue({
      antaresErrorMessage: 'import failed',
      errorMessageArguments: ['args'],
      date: '2028-08-07T14:17:09.895028' as unknown as Date,
      type: ERROR_MESSAGE_TYPE.TECHNICAL,
    });

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.LOAD, value, [0], data, mockSetData);
    });

    expect(handleTrajectoryError).not.toHaveBeenCalled();
  });

  it('should use OTHER_AREAS when hypothesis is OTHER_AREAS_LABEL', async () => {
    const dataWithOther = [{ hypothesis: OTHER_AREAS_LABEL }] as HypothesisRowData[];
    (uploadTrajectory as Mock).mockResolvedValue({ id: 102 });

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.LOAD, value, [0], dataWithOther, mockSetData);
    });

    expect(uploadTrajectory).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LOAD,
      'Trajectory A',
      2030,
      'study-001',
      OTHER_AREAS,
      expect.any(Function),
      false,
      undefined,
    );
  });

  it('should use OTHER_AREAS when hypothesis is OTHER_AREAS_LABEL', async () => {
    const dataWithOther = [{ hypothesis: OTHER_AREAS_LABEL }] as HypothesisRowData[];
    (uploadTrajectory as Mock).mockResolvedValue({ id: 102 });

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.DSR, value, [0], dataWithOther, mockSetData);
    });

    expect(uploadTrajectory).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR,
      'Trajectory A',
      2030,
      'study-001',
      OTHER_AREAS,
      expect.any(Function),
      false,
      undefined,
    );
  });

  it('should use set read only when trajectory type is DSR', async () => {
    const dataWithOther = [{ hypothesis: 'AT', status: TRAJECTORY_SELECTION_STATUS.OK }] as HypothesisRowData[];
    (uploadTrajectory as Mock).mockResolvedValue({ id: 102, hasTimeSeries: true });

    const { result } = renderHook(() => useTrajectoryImport(study, studyState, mockDispatch, mockSetReadOnly));

    await act(async () => {
      await result.current.importTrajectory(TRAJECTORY_TYPE.DSR, value, [0], dataWithOther, mockSetData);
    });

    expect(uploadTrajectory).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR,
      'Trajectory A',
      2030,
      'study-001',
      'AT',
      expect.any(Function),
      false,
      undefined,
    );
  });
});
