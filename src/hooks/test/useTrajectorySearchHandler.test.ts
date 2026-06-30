import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTrajectorySearchHandler } from '@/hooks/useTrajectorySearchHandler.ts';
import { StudyDTO } from '@/shared/types';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import { act, renderHook } from '@testing-library/react';

vi.mock('@/shared/services/hypothesisTableService', () => ({
  handleTrajectorySearch: vi.fn(),
}));

describe('useTrajectorySearchHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call handleTrajectorySearch with correct parameters for a normal type', async () => {
    const setDbTrajectories = vi.fn();
    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyData,
        setDbTrajectories,
      }),
    );

    const searchParams = { area: 'FR', technology: 'Tech 2', fileNameContains: 'file' };

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.STS, [0, 1], searchParams);
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.STS,
      setDbTrajectories,
      2030,
      {
        area: 'FR',
        technology: 'Tech 2',
        fileNameContains: 'file',
      },
    );
  });

  it('should switch type when TRAJECTORY_TYPE.AREA is used', async () => {
    const setDbTrajectories = vi.fn();
    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyData,
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.AREA, [0], { fileNameContains: 'abc' });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.AREA,
      setDbTrajectories,
      2030,
      {
        fileNameContains: 'abc',
      },
    );
  });

  it('should switch type when TRAJECTORY_TYPE.AREA is used', async () => {
    const setDbTrajectories = vi.fn();
    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyData,
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.AREA, [1], { fileNameContains: 'abc' });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LINK,
      setDbTrajectories,
      2030,
      { fileNameContains: 'abc' },
    );
  });

  it('should switch type for last index when type is DSR', async () => {
    const setDbTrajectories = vi.fn();
    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyData,
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.DSR, [1], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR,
      setDbTrajectories,
      2030,
      {
        area: 'Area A',
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is DSR', async () => {
    const setDbTrajectories = vi.fn();
    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyData,
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.DSR, [1], {
        area: 'Area A',
        fileNameContains: 'BP',
        isLastIndex: true,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION,
      setDbTrajectories,
      2030,
      {
        fileNameContains: 'BP',
      },
    );
  });

  it('should switch type for last index when type is HYDRO_SERIES', async () => {
    const setDbTrajectories = vi.fn();
    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyData,
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.HYDRO_SERIES, [1], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
      setDbTrajectories,
      2030,
      {
        area: 'Area A',
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is HYDRO_PSP_SERIES', async () => {
    const setDbTrajectories = vi.fn();

    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyData,
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.HYDRO_PSP_SERIES, [1], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS,
      setDbTrajectories,
      2030,
      {
        area: 'Area A',
        fileNameContains: 'xyz',
      },
    );
  });
});
