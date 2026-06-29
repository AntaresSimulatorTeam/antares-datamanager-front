import { describe, expect, it, vi } from 'vitest';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import { renderHook } from '@testing-library/react';

vi.mock('@/shared/services/hypothesisTableService.ts', () => ({
  handleFetchTrajectoriesFS: vi.fn(),
}));
vi.mock('@/shared/services/trajectoryService.ts', () => ({
  fetchTrajectoriesFromFS: vi.fn(),
}));

describe('useTrajectoryFetchFromFSHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call fetchTrajectoriesFromFS with correct params for standard type', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.LOAD,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.LOAD,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.LOAD,
      areaToUse: 'Area A',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(TRAJECTORY_TYPE.LOAD, 'Area A');
  });

  it('should use type when TRAJECTORY_TYPE.AREA is used', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.AREA,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.AREA,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.AREA,
      areaToUse: '',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(TRAJECTORY_TYPE.AREA);
  });

  it('should switch to LINK type for last index when TRAJECTORY_TYPE.AREA is used', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.LINK,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.LINK,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.LINK,
      areaToUse: '',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(TRAJECTORY_TYPE.LINK);
  });

  it('should switch to DSR_CAPACITY_MODULATION type for last index when type is DSR', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION,
      areaToUse: '',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION);
  });

  it('should use subRows hypothesis when type is STS', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.STS,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.STS,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.STS,
      areaToUse: 'battery',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(TRAJECTORY_TYPE.STS, 'battery');
  });

  it('should use HYDRO_SERIES type for first index when type is HYDRO SERIES', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.HYDRO_SERIES,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.HYDRO_SERIES,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.HYDRO_SERIES,
      areaToUse: '',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(TRAJECTORY_TYPE.HYDRO_SERIES);
  });

  it('should use HYDRO_TECHNICAL_PARAMETERS type for last index when type is HYDRO SERIES', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
      areaToUse: '',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS);
  });

  it('should use HYDRO_PSP_SERIES type for first index when type is HYDRO PSP SERIES', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
      areaToUse: '',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(TRAJECTORY_TYPE.HYDRO_PSP_SERIES);
  });

  it('should use HYDRO_PSP_TECHNICAL_PARAMETERS type for last index when type is HYDRO PSP SERIES', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValue([
      {
        trajectoryName: 'CBN_Perim_Restreint',
        type: TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS,
        lastModifiedDate: '2026-06-04T17:42:32.673883418' as unknown as Date,
      },
      {
        trajectoryName: 'AFL_Perim_Restreint',
        type: TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS,
        lastModifiedDate: '2026-06-04T17:42:27.753881156' as unknown as Date,
      },
    ]);
    const { result } = renderHook(() => useTrajectoryFetchFromFSHandler());
    await result.current.handleFetchFromFS({
      typeToUse: TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS,
      areaToUse: '',
      isDefaultArea: false,
    });

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS,
    );
  });
});
