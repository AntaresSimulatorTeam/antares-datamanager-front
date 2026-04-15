import { describe, expect, it, vi } from 'vitest';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTrajectoryFetchFromFSHandler } from '@/hooks/useTrajectoryFetchFromFSHandler.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import { HypothesisRowData } from '@/shared/types';
import { renderHook } from '@testing-library/react';

vi.mock('@/shared/services/hypothesisTableService.ts', () => ({
  handleFetchTrajectoriesFS: vi.fn(),
}));

describe('useTrajectoryFetchFromFSHandler', () => {
  const setOptionsFS = vi.fn();
  const setRowIdSelected = vi.fn();
  const toggleModal = vi.fn();

  it('should call handleFetchTrajectoriesFS with correct params for standard type', async () => {
    const data = [
      { hypothesis: 'Area A', subRows: [] as HypothesisRowData[] },
      { hypothesis: 'Area B', subRows: [] },
    ] as HypothesisRowData[];

    const defaultAreas = [{ name: 'Area A' }];

    const { result } = renderHook(() =>
      useTrajectoryFetchFromFSHandler({
        data,
        type: TRAJECTORY_TYPE.LOAD,
        defaultAreas,
        setOptionsFS,
        setRowIdSelected,
        toggleModal,
      }),
    );

    await result.current.handleFetchFromFS('0');

    expect(hypothesisTableService.handleFetchTrajectoriesFS).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LOAD,
      '0',
      setOptionsFS,
      setRowIdSelected,
      toggleModal,
      'Area A',
      true,
    );
  });

  it('should switch type when TRAJECTORY_TYPE.AREA is used', async () => {
    const data = [
      { hypothesis: 'Area A', subRows: [] as HypothesisRowData[] },
      { hypothesis: 'Area B', subRows: [] },
    ] as HypothesisRowData[];

    const { result } = renderHook(() =>
      useTrajectoryFetchFromFSHandler({
        data,
        type: TRAJECTORY_TYPE.AREA,
        defaultAreas: [],
        setOptionsFS,
        setRowIdSelected,
        toggleModal,
      }),
    );

    await result.current.handleFetchFromFS('1');

    expect(hypothesisTableService.handleFetchTrajectoriesFS).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LINK,
      '1',
      setOptionsFS,
      setRowIdSelected,
      toggleModal,
      '',
      false,
    );
  });

  it('should switch type for last index when type is DSR', async () => {
    const data = [
      { hypothesis: 'Area A', subRows: [] as HypothesisRowData[] },
      { hypothesis: 'Area B', subRows: [] },
    ] as HypothesisRowData[];

    const { result } = renderHook(() =>
      useTrajectoryFetchFromFSHandler({
        data,
        type: TRAJECTORY_TYPE.DSR,
        defaultAreas: [{ name: 'Area A' }],
        setOptionsFS,
        setRowIdSelected,
        toggleModal,
      }),
    );

    await result.current.handleFetchFromFS('1');

    expect(hypothesisTableService.handleFetchTrajectoriesFS).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION,
      '1',
      setOptionsFS,
      setRowIdSelected,
      toggleModal,
      '',
      false, // isDefaultArea forcé à false
    );
  });

  it('should use subRows hypothesis when type is STS', async () => {
    const data = [
      {
        hypothesis: 'Area A',
        subRows: [{ hypothesis: 'Tech 1' }, { hypothesis: 'Tech 2' }],
      },
    ] as HypothesisRowData[];

    const { result } = renderHook(() =>
      useTrajectoryFetchFromFSHandler({
        data,
        type: TRAJECTORY_TYPE.STS,
        defaultAreas: [],
        setOptionsFS,
        setRowIdSelected,
        toggleModal,
      }),
    );

    await result.current.handleFetchFromFS('0.1');

    expect(hypothesisTableService.handleFetchTrajectoriesFS).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.STS,
      '0.1',
      setOptionsFS,
      setRowIdSelected,
      toggleModal,
      'Tech 2',
      false,
    );
  });
});
