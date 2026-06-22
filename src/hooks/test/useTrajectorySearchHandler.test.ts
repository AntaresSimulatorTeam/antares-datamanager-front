import { describe, expect, it, vi } from 'vitest';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTrajectorySearchHandler } from '@/hooks/useTrajectorySearchHandler.ts';
import { HypothesisRowData, SelectOption, StudyDTO } from '@/shared/types';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import { renderHook } from '@testing-library/react';

vi.mock('@/shared/services/hypothesisTableService', () => ({
  handleTrajectorySearch: vi.fn(),
}));

describe('useTrajectorySearchHandler', () => {
  it('should call handleTrajectorySearch with correct parameters for a normal type', async () => {
    const setDbTrajectories = vi.fn();

    const data = [
      {
        hypothesis: 'Area A',
        subRows: [{ hypothesis: 'Tech 1' }, { hypothesis: 'Tech 2' }],
      },
      {
        hypothesis: 'Area B',
        subRows: [],
      },
    ] as HypothesisRowData[];

    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        data,
        type: TRAJECTORY_TYPE.STS,
        studyData,
        setDbTrajectories,
      }),
    );

    // Mock retour du service
    const mockResult = [{ label: 'X', value: 'X' }] as unknown as SelectOption[];
    vi.mocked(hypothesisTableService.handleTrajectorySearch).mockResolvedValue(mockResult);

    const resultData = await result.current.handleSearch('file', '0.1');

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.STS,
      setDbTrajectories,
      2030,
      {
        area: 'Area A',
        technology: 'Tech 2',
        fileNameContains: 'file',
      },
    );

    expect(resultData).toEqual(mockResult);
  });

  it('should switch type when TRAJECTORY_TYPE.AREA is used', async () => {
    const setDbTrajectories = vi.fn();

    const data = [
      { hypothesis: 'Area A', subRows: [] as HypothesisRowData[] },
      { hypothesis: 'Area B', subRows: [] as HypothesisRowData[] },
    ] as HypothesisRowData[];

    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        data,
        type: TRAJECTORY_TYPE.AREA,
        studyData,
        setDbTrajectories,
      }),
    );

    vi.mocked(hypothesisTableService.handleTrajectorySearch).mockResolvedValue([]);

    await result.current.handleSearch('abc', '0');

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.AREA,
      setDbTrajectories,
      2030,
      {
        area: '',
        technology: undefined,
        fileNameContains: 'abc',
      },
    );
  });

  it('should switch type when TRAJECTORY_TYPE.AREA is used', async () => {
    const setDbTrajectories = vi.fn();

    const data = [
      { hypothesis: 'Area A', subRows: [] as HypothesisRowData[] },
      { hypothesis: 'Area B', subRows: [] as HypothesisRowData[] },
    ] as HypothesisRowData[];

    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        data,
        type: TRAJECTORY_TYPE.AREA,
        studyData,
        setDbTrajectories,
      }),
    );

    vi.mocked(hypothesisTableService.handleTrajectorySearch).mockResolvedValue([]);

    await result.current.handleSearch('abc', '1');

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LINK,
      setDbTrajectories,
      2030,
      {
        area: '',
        technology: undefined,
        fileNameContains: 'abc',
      },
    );
  });

  it('should switch type for last index when type is DSR', async () => {
    const setDbTrajectories = vi.fn();

    const data = [
      { hypothesis: 'Area A', subRows: [] as HypothesisRowData[] },
      { hypothesis: 'Area B', subRows: [] as HypothesisRowData[] },
    ] as HypothesisRowData[];

    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        data,
        type: TRAJECTORY_TYPE.DSR,
        studyData,
        setDbTrajectories,
      }),
    );

    vi.mocked(hypothesisTableService.handleTrajectorySearch).mockResolvedValue([]);

    await result.current.handleSearch('xyz', '0');

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR,
      setDbTrajectories,
      2030,
      {
        area: 'Area A',
        technology: undefined,
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is DSR', async () => {
    const setDbTrajectories = vi.fn();

    const data = [
      { hypothesis: 'Area A', subRows: [] as HypothesisRowData[] },
      { hypothesis: 'Area B', subRows: [] as HypothesisRowData[] },
    ] as HypothesisRowData[];

    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        data,
        type: TRAJECTORY_TYPE.DSR,
        studyData,
        setDbTrajectories,
      }),
    );

    vi.mocked(hypothesisTableService.handleTrajectorySearch).mockResolvedValue([]);

    await result.current.handleSearch('xyz', '1');

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION,
      setDbTrajectories,
      2030,
      {
        area: '',
        technology: undefined,
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is HYDRO_SERIES', async () => {
    const setDbTrajectories = vi.fn();

    const data = [
      { hypothesis: 'Area A', subRows: [{ hypothesis: 'Series', subRows: [] as HypothesisRowData[] }] },
    ] as HypothesisRowData[];

    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        data,
        type: TRAJECTORY_TYPE.HYDRO_SERIES,
        studyData,
        setDbTrajectories,
      }),
    );

    vi.mocked(hypothesisTableService.handleTrajectorySearch).mockResolvedValue([]);

    await result.current.handleSearch('xyz', '0.1');

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
      setDbTrajectories,
      2030,
      {
        area: 'Area A',
        technology: undefined,
        fileNameContains: 'xyz',
      },
    );
  });

  it('should switch type for last index when type is HYDRO_PSP_SERIES', async () => {
    const setDbTrajectories = vi.fn();

    const data = [
      { hypothesis: 'Area A', subRows: [{ hypothesis: 'Series', subRows: [] as HypothesisRowData[] }] },
    ] as HypothesisRowData[];

    const studyData = { horizon: 2030 } as unknown as StudyDTO;

    const { result } = renderHook(() =>
      useTrajectorySearchHandler({
        data,
        type: TRAJECTORY_TYPE.HYDRO_PSP_SERIES,
        studyData,
        setDbTrajectories,
      }),
    );

    vi.mocked(hypothesisTableService.handleTrajectorySearch).mockResolvedValue([]);

    await result.current.handleSearch('xyz', '0.1');

    expect(hypothesisTableService.handleTrajectorySearch).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS,
      setDbTrajectories,
      2030,
      {
        area: 'Area A',
        technology: undefined,
        fileNameContains: 'xyz',
      },
    );
  });
});
