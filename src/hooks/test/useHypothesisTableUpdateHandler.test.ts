import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useHypothesisTableUpdateHandler } from '@/hooks/useHypothesisTableUpdateHandler.ts';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

vi.mock('@/store/contexts/StudyContext.tsx', () => ({
  useStudyDispatch: () => vi.fn(),
}));

const mockAttach = vi.fn();
const mockDetach = vi.fn();

vi.mock('@/hooks/useTrajectoryAttach.ts', () => ({
  useTrajectoryAttach: () => ({ attachTrajectory: mockAttach }),
}));

vi.mock('@/hooks/useTrajectoryDetach.ts', () => ({
  useTrajectoryDetach: () => ({ detachTrajectory: mockDetach }),
}));

describe('useHypothesisTableUpdateHandler', () => {
  const setData = vi.fn();
  const setRowToDelete = vi.fn();
  const setIsDeletionModalOpen = vi.fn();
  const setRowIdSelected = vi.fn();
  const setReadOnly = vi.fn();
  const setSecondTableReadOnly = vi.fn();
  const setSecondData = vi.fn();

  const studyData: StudyDTO = {
    id: 1,
    name: 'Study',
    createdBy: undefined,
    creationDate: new Date('2026-01-01'),
    keywords: [],
    project: 'Project',
    projectId: '1',
    status: StudyStatus.IN_PROGRESS,
    horizon: '2030',
    trajectoryIds: [],
    hvdc: false,
    recalculate: false,
  };
  const trajectory: DbTrajectory = {
    id: 42,
    trajectoryName: 'Trajectory A',
    type: TRAJECTORY_TYPE.LOAD,
    version: 1,
    userName: 'user',
    creationDate: new Date('2026-01-01'),
    area: 'Area A',
    technology: '',
    hasTimeSeries: true,
  };
  const data: HypothesisRowData[] = [
    { hypothesis: 'Area A', trajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
  ];
  const updateArgs = {
    rowId: '0',
    type: TRAJECTORY_TYPE.LOAD,
    data,
    setData,
    setReadOnly,
  };

  const renderUpdateHandler = (dbTrajectories: DbTrajectory[] = [], withRowToDelete = true) =>
    renderHook(() =>
      useHypothesisTableUpdateHandler({
        studyData,
        setRowToDelete: withRowToDelete ? setRowToDelete : undefined,
        setIsDeletionModalOpen,
        dbTrajectories,
        setRowIdSelected,
      }),
    );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each(['empty', 'emptyError'] as const)('should detach trajectory when status is %s', async (status) => {
    const { result } = renderUpdateHandler();

    await result.current.handleHypothesisTableUpdate({ ...updateArgs, status });

    expect(mockDetach).toHaveBeenCalledTimes(1);
    expect(mockDetach).toHaveBeenCalledWith({
      type: TRAJECTORY_TYPE.LOAD,
      indexArray: [0],
      setData,
      data,
      status,
      hypothesis: 'Area A',
      setReadOnly,
      setSecondTableReadOnly: undefined,
      secondData: undefined,
      setSecondData: undefined,
      shouldUpdateHvdc: undefined,
    });
    expect(mockAttach).not.toHaveBeenCalled();
    expect(setIsDeletionModalOpen).not.toHaveBeenCalled();
  });

  it.each([true, false])('should forward second table options and shouldUpdateHvdc=%s when detaching', async (shouldUpdateHvdc) => {
    const secondData: HypothesisRowData[] = [
      { hypothesis: 'HVDC', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    ];
    const { result } = renderUpdateHandler();

    await result.current.handleHypothesisTableUpdate({
      ...updateArgs,
      status: 'empty',
      setSecondTableReadOnly,
      secondData,
      setSecondData,
      shouldUpdateHvdc,
    });

    expect(mockDetach).toHaveBeenCalledTimes(1);
    expect(mockDetach).toHaveBeenCalledWith({
      type: TRAJECTORY_TYPE.LOAD,
      indexArray: [0],
      setData,
      data,
      status: 'empty',
      hypothesis: 'Area A',
      setReadOnly,
      setSecondTableReadOnly,
      secondData,
      setSecondData,
      shouldUpdateHvdc,
    });
  });

  it.each(['empty', 'emptyError'] as const)('should open the DSR capacity modulation deletion modal for %s', async (status) => {
    const dsrData: HypothesisRowData[] = [
      ...data,
      { hypothesis: 'Capacity modulation', trajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
    ];
    const { result } = renderUpdateHandler();

    await result.current.handleHypothesisTableUpdate({
      ...updateArgs,
      status,
      type: TRAJECTORY_TYPE.DSR,
      data: dsrData,
    });

    expect(setRowToDelete).toHaveBeenCalledTimes(1);
    expect(setRowToDelete).toHaveBeenCalledWith({
      index: 0,
      value: 'Area A',
      operation: 'empty',
    });
    expect(setIsDeletionModalOpen).toHaveBeenCalledTimes(1);
    expect(setIsDeletionModalOpen).toHaveBeenCalledWith(true);
    expect(mockDetach).not.toHaveBeenCalled();
    expect(mockAttach).not.toHaveBeenCalled();
  });

  it('should open the DSR deletion modal without an optional setRowToDelete callback', async () => {
    const { result } = renderUpdateHandler([], false);

    await result.current.handleHypothesisTableUpdate({
      ...updateArgs,
      status: 'empty',
      type: TRAJECTORY_TYPE.DSR,
      data: [
        ...data,
        { hypothesis: 'Capacity modulation', trajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
      ],
    });

    expect(setIsDeletionModalOpen).toHaveBeenCalledTimes(1);
    expect(setIsDeletionModalOpen).toHaveBeenCalledWith(true);
    expect(setRowToDelete).not.toHaveBeenCalled();
    expect(mockDetach).not.toHaveBeenCalled();
  });

  it('should detach DSR without opening the modal when capacity modulation is missing', async () => {
    const { result } = renderUpdateHandler();

    await result.current.handleHypothesisTableUpdate({
      ...updateArgs,
      status: 'empty',
      type: TRAJECTORY_TYPE.DSR,
      data: [
        ...data,
        { hypothesis: 'Capacity modulation', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      ],
    });

    expect(mockDetach).toHaveBeenCalledWith(expect.objectContaining({ type: TRAJECTORY_TYPE.DSR }));
    expect(setRowToDelete).not.toHaveBeenCalled();
    expect(setIsDeletionModalOpen).not.toHaveBeenCalled();
  });

  it('should attach the selected database trajectory with the second table read-only setter', async () => {
    const selectedTrajectory = { ...trajectory, id: 43 };
    const { result } = renderUpdateHandler([trajectory, selectedTrajectory]);

    await result.current.handleHypothesisTableUpdate({
      ...updateArgs,
      value: '43',
      status: 'success',
      setSecondTableReadOnly,
    });

    expect(mockAttach).toHaveBeenCalledTimes(1);
    expect(mockAttach).toHaveBeenCalledWith({
      type: TRAJECTORY_TYPE.LOAD,
      indexArray: [0],
      status: 'success',
      trajectory: selectedTrajectory,
      setData,
      setReadOnly,
      setSecondTableReadOnly,
      isFlowbasedRedOnly: undefined,
    });
    expect(mockDetach).not.toHaveBeenCalled();
  });

  it('should attach the row trajectory when database trajectories are empty and value is omitted', async () => {
    const { result } = renderUpdateHandler();

    await result.current.handleHypothesisTableUpdate({ ...updateArgs, status: 'success' });

    expect(mockAttach).toHaveBeenCalledTimes(1);
    expect(mockAttach).toHaveBeenCalledWith({
      type: TRAJECTORY_TYPE.LOAD,
      indexArray: [0],
      status: 'success',
      trajectory,
      setData,
      setReadOnly,
      setSecondTableReadOnly: undefined,
      isFlowbasedRedOnly: undefined,
    });
  });

  it.each([true, false])('should forward isFlowbasedRedOnly=%s when attaching', async (hvdc) => {
    const { result } = renderUpdateHandler([trajectory]);

    await result.current.handleHypothesisTableUpdate({
      ...updateArgs,
      type: TRAJECTORY_TYPE.LINK,
      value: trajectory.id,
      status: 'success',
      data: [...data, { ...data[0], hvdc }],
      setSecondTableReadOnly,
    });

    expect(mockAttach).toHaveBeenCalledWith({
      type: TRAJECTORY_TYPE.LINK,
      indexArray: [0],
      status: 'success',
      trajectory,
      setData,
      setReadOnly,
      setSecondTableReadOnly,
      isFlowbasedRedOnly: hvdc,
    });
  });

  it('should not fall back to the row trajectory when no database trajectory matches', async () => {
    const { result } = renderUpdateHandler([trajectory]);

    await result.current.handleHypothesisTableUpdate({ ...updateArgs, value: 999, status: 'success' });

    expect(mockAttach).not.toHaveBeenCalled();
    expect(mockDetach).not.toHaveBeenCalled();
  });

  it('should not attach when the selected row has no trajectory', async () => {
    const { result } = renderUpdateHandler();

    await result.current.handleHypothesisTableUpdate({
      ...updateArgs,
      status: 'success',
      data: [{ ...data[0], trajectory: null }],
    });

    expect(mockAttach).not.toHaveBeenCalled();
  });

  it.each(['empty', 'emptyError', 'success'] as const)('should ignore a missing row for status %s', async (status) => {
    const { result } = renderUpdateHandler();

    await result.current.handleHypothesisTableUpdate({ ...updateArgs, rowId: '5', status });

    expect(mockAttach).not.toHaveBeenCalled();
    expect(mockDetach).not.toHaveBeenCalled();
    expect(setIsDeletionModalOpen).not.toHaveBeenCalled();
  });

  it.each(['empty', 'emptyError', 'success'] as const)('should handle an omitted rowId for status %s', async (status) => {
    const { rowId: _rowId, ...argsWithoutRowId } = updateArgs;
    const { result } = renderUpdateHandler();

    await result.current.handleHypothesisTableUpdate({ ...argsWithoutRowId, status });

    expect(mockAttach).not.toHaveBeenCalled();
    expect(mockDetach).not.toHaveBeenCalled();
    expect(setIsDeletionModalOpen).not.toHaveBeenCalled();
  });

  it.each(['warning', 'error', 'loading', undefined] as const)('should ignore status %s', async (status) => {
    const { result } = renderUpdateHandler([trajectory]);

    await result.current.handleHypothesisTableUpdate({ ...updateArgs, value: trajectory.id, status });

    expect(mockAttach).not.toHaveBeenCalled();
    expect(mockDetach).not.toHaveBeenCalled();
    expect(setIsDeletionModalOpen).not.toHaveBeenCalled();
  });

  describe.each([
    { type: TRAJECTORY_TYPE.AREA, rowId: '0', expectedType: TRAJECTORY_TYPE.AREA, hypothesis: 'Area A' },
    { type: TRAJECTORY_TYPE.AREA, rowId: '1', expectedType: TRAJECTORY_TYPE.LINK, hypothesis: 'Link B' },
    { type: TRAJECTORY_TYPE.HYDRO_SERIES, rowId: '0.1', expectedType: TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS, hypothesis: 'Area A' },
    { type: TRAJECTORY_TYPE.HYDRO_SERIES, rowId: '0.0', expectedType: TRAJECTORY_TYPE.HYDRO_SERIES, hypothesis: 'Area A' },
    { type: TRAJECTORY_TYPE.DSR, rowId: '1', expectedType: TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION, hypothesis: 'Link B' },
  ])('$type at row $rowId', ({ type, rowId, expectedType, hypothesis }) => {
    const nestedData: HypothesisRowData[] = [
      { ...data[0], subRows: [{ ...data[0], hypothesis: 'Series' }, { ...data[0], hypothesis: 'Parameters' }] },
      { ...data[0], hypothesis: 'Link B' },
    ];

    it('should detach using the resolved type and parent hypothesis', async () => {
      const { result } = renderUpdateHandler();

      await result.current.handleHypothesisTableUpdate({
        ...updateArgs,
        rowId,
        type,
        status: 'empty',
        data: nestedData,
      });

      expect(mockDetach).toHaveBeenCalledTimes(1);
      expect(mockDetach).toHaveBeenCalledWith({
        type: expectedType,
        indexArray: rowId.split('.').map(Number),
        setData,
        data: nestedData,
        status: 'empty',
        hypothesis,
        setReadOnly,
        setSecondTableReadOnly: undefined,
        secondData: undefined,
        setSecondData: undefined,
        shouldUpdateHvdc: undefined,
      });
    });

    it('should attach using the resolved type', async () => {
      const { result } = renderUpdateHandler([trajectory]);

      await result.current.handleHypothesisTableUpdate({
        ...updateArgs,
        rowId,
        type,
        status: 'success',
        value: trajectory.id,
        data: nestedData,
      });

      expect(mockAttach).toHaveBeenCalledTimes(1);
      expect(mockAttach).toHaveBeenCalledWith({
        type: expectedType,
        indexArray: rowId.split('.').map(Number),
        status: 'success',
        trajectory,
        setData,
        setReadOnly,
        setSecondTableReadOnly: undefined,
        isFlowbasedRedOnly: undefined,
      });
    });
  });
});
