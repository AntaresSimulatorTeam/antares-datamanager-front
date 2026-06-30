import { describe, expect, it, vi } from 'vitest';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTrajectorySearchHandler } from '@/hooks/useTrajectorySearchHandler.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import { act, renderHook, waitFor } from '@testing-library/react';

vi.mock('@/shared/services/hypothesisTableService', () => ({
  handleTrajectorySearch: vi.fn(),
}));

describe('useTrajectorySearchHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call handleTrajectorySearch with correct parameters for a normal type', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
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
      '2030',
      {
        area: 'FR',
        technology: 'Tech 2',
        fileNameContains: 'file',
      },
    );
  });

  it('should switch type when TRAJECTORY_TYPE.AREA is used', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.AREA, [0], { fileNameContains: 'abc' });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.AREA,
      setDbTrajectories,
      '2030',
      {
        fileNameContains: 'abc',
      },
    );
  });

  it('should switch type when TRAJECTORY_TYPE.AREA is used', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.AREA, [1], { fileNameContains: 'abc' });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LINK,
      setDbTrajectories,
      '2030',
      { fileNameContains: 'abc' },
    );
  });

  it('should switch type for last index when type is DSR', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
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
      '2030',
      {
        area: 'Area A',
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is DSR', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
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
      '2030',
      {
        fileNameContains: 'BP',
      },
    );
  });

  it('should switch type for last index when type is HYDRO_SERIES', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.HYDRO_SERIES, [0, 0], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_SERIES,
      setDbTrajectories,
      '2030',
      {
        area: 'Area A',
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is HYDRO_SERIES', async () => {
    const setDbTrajectories = vi.fn();
    vi.mocked(hypothesisTableService.handleTrajectorySearch).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await waitFor(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.HYDRO_SERIES, [0, 1], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
      setDbTrajectories,
      '2030',
      {
        area: 'Area A',
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is HYDRO_PSP_SERIES', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.HYDRO_PSP_SERIES, [0, 0], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
      setDbTrajectories,
      '2030',
      {
        area: 'Area A',
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is HYDRO_PSP_SERIES', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.HYDRO_PSP_SERIES, [0, 1], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS,
      setDbTrajectories,
      '2030',
      {
        area: 'Area A',
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is NUCLEAR_FR_MODULATION', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [0], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION,
      setDbTrajectories,
      '2030',
      {
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is NUCLEAR_FR_TALON', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [1], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.NUCLEAR_FR_TALON,
      setDbTrajectories,
      '2030',
      {
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is NUCLEAR_FR_TS_ERP', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [2, 0], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP,
      setDbTrajectories,
      '2030',
      {
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is NUCLEAR_FR_TS_LONG_TERM', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [2, 1], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM,
      setDbTrajectories,
      '2030',
      {
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is NUCLEAR_FR_TS_LONG_TERM', async () => {
    const setDbTrajectories = vi.fn();

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        studyHorizon: '2030',
        setDbTrajectories,
      }),
    );

    await act(async () => {
      await result.current.handleSearch(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [2, 2], {
        area: 'Area A',
        fileNameContains: 'xyz',
        isLastIndex: false,
      });
    });

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR,
      setDbTrajectories,
      '2030',
      {
        fileNameContains: 'xyz',
      },
    );
  });
});
