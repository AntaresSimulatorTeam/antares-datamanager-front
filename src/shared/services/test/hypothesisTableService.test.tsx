import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  addRow,
  handleFetchTrajectoriesFS,
  handleTrajectoryError,
  handleTrajectorySearch,
} from '@/shared/services/hypothesisTableService.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { DbTrajectory, FsTrajectory, HypothesisRowData, SelectOption, StudyDTO } from '@/shared/types';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import * as formFormatter from '@/shared/utils/formFormatter';
import { ThermalOptions } from '@/mocks/data/list/names.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { Dispatch, SetStateAction } from 'react';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

vi.mock('@/shared/notification/notification');

vi.mock('@/shared/utils/defaultUtils.ts', () => ({
  generateId: vi.fn(() => 'DEMAND-NewHypothesis'),
}));

vi.mock('@/shared/services/trajectoryService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    fetchTrajectoriesFromFS: vi.fn(),
    fetchTrajectoriesFromDB: vi.fn(),
  };
});

vi.mock('@/shared/utils/formFormatter', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    convertToFSSelectionOptionType: vi.fn(),
    convertToSelectionOptionType: vi.fn(),
  };
});

describe('handleTrajectoryError', () => {
  it('should update data and trigger alert', () => {
    const mockSetData = vi.fn();
    const type = 'SOME_TYPE' as TRAJECTORY_TYPE;
    const rowIndex = [0, 1];
    const trajectory = { id: 42, label: 'Test Trajectory' };
    const hypothesis = 'Hypothesis A';
    const userName = 'Alice';
    const alert = { message: 'Error occurred', content: 'Invalid trajectory' };

    vi.mock('@/shared/utils/trajectoryUtils', async (importOriginal) => {
      const actual: Mock = await importOriginal();
      return {
        ...actual,
        setNestedData: vi
          .fn()
          .mockImplementation(
            (prev: HypothesisRowData[], _index, update) => [{ ...prev[0], ...update }] as HypothesisRowData[],
          ),
        buildErrorTrajectory: vi.fn().mockReturnValue({
          id: 42,
          label: 'Test Trajectory',
          error: true,
          user: 'Alice',
          hypothesis: 'Hypothesis A',
        }),
      };
    });

    handleTrajectoryError(type, rowIndex, trajectory, hypothesis, userName, mockSetData, alert);

    // Vérifie que setData est appelé avec une fonction
    expect(mockSetData).toHaveBeenCalled();
    const setDataCallback = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const result = setDataCallback([
      {
        trajectory: {} as DbTrajectory,
        status: '' as TRAJECTORY_SELECTION_STATUS,
        hypothesis: '',
      },
    ]);

    expect(result[0].trajectory).toEqual({
      id: 42,
      label: 'Test Trajectory',
      error: true,
      user: 'Alice',
      hypothesis: 'Hypothesis A',
    });
    expect(result[0].status).toBe(TRAJECTORY_SELECTION_STATUS.ERROR);

    expect(notifyAlert).toHaveBeenCalledWith({
      icon: StdIconId.Close,
      message: alert.message,
      content: alert.content,
      type: 'error',
      filledIcon: true,
    });
  });
});

describe('handleFetchTrajectoriesFS', () => {
  it('should fetch trajectories and update state correctly', async () => {
    const mockResults = [{ id: 1, label: 'Trajectory A' }] as unknown as FsTrajectory[];
    const mockConvertedOptions = [{ value: '1', label: 'Trajectory A' }] as unknown as SelectOption[];
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.LOAD;
    const rowId = 'row-123';
    const hypothesis = 'Hypothesis X';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, 'default', hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, '', hypothesis);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for OTHERS area and update state correctly', async () => {
    const mockResults = [{ id: 1, label: 'Trajectory A' }] as unknown as FsTrajectory[];
    const mockConvertedOptions = [{ value: '1', label: 'Trajectory A' }] as unknown as SelectOption[];
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.LOAD;
    const rowId = 'row-123';

    await handleFetchTrajectoriesFS(
      type,
      rowId,
      setOptionsFS,
      setRowIdSelected,
      toggleModal,
      'default',
      OTHER_AREAS_LABEL,
    );

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, '', OTHER_AREAS);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for THERMAL CAPACITY AREA area and update state correctly', async () => {
    const mockResults = [{ id: 1, label: 'Trajectory A' }] as unknown as FsTrajectory[];
    const mockConvertedOptions = [{ value: '1', label: 'Trajectory A' }] as unknown as SelectOption[];
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.THERMAL_CAPACITY;
    const rowId = 'row-123';
    const hypothesis = 'FR Default';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, 'default', hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, '', 'FR');
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should handle fetch error silently', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockRejectedValue(new Error('Fetch failed'));
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    await expect(
      handleFetchTrajectoriesFS(
        'TYPE' as TRAJECTORY_TYPE,
        'row-1',
        setOptionsFS,
        setRowIdSelected,
        toggleModal,
        'hypothesis',
      ),
    ).resolves.toBeUndefined();

    expect(setOptionsFS).not.toHaveBeenCalled();
    expect(setRowIdSelected).not.toHaveBeenCalled();
    expect(toggleModal).not.toHaveBeenCalled();
  });
});

describe('handleTrajectorySearch', () => {
  it('should fetch trajectories and return converted options', async () => {
    const mockResults = [
      { id: 1, label: 'Trajectory A' },
      { id: 2, label: 'Trajectory B' },
    ] as unknown as DbTrajectory[];
    const mockConvertedOptions = [
      { value: '1', label: 'Trajectory A' },
      { value: '2', label: 'Trajectory B' },
    ] as unknown as SelectOption[];

    vi.mocked(trajectoryService.fetchTrajectoriesFromDB).mockResolvedValue(mockResults);
    vi.mocked(formFormatter.convertToSelectionOptionType).mockReturnValue(mockConvertedOptions);
    const setDbTrajectories = vi.fn();

    const type = 'TYPE_A' as TRAJECTORY_TYPE;
    const value = 'searchValue';
    const area = 'Area51';
    const study = { horizon: '2025' } as StudyDTO;

    const result = await handleTrajectorySearch(type, value, area, setDbTrajectories, study);

    expect(trajectoryService.fetchTrajectoriesFromDB).toHaveBeenCalledWith(type, study.horizon, value, area, undefined);
    expect(setDbTrajectories).toHaveBeenCalledWith(mockResults);
    expect(formFormatter.convertToSelectionOptionType).toHaveBeenCalledWith(mockResults);
    expect(result).toEqual(mockConvertedOptions);
  });

  it('should handle errors silently and return undefined', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromDB).mockRejectedValue(new Error('DB error'));
    const setDbTrajectories = vi.fn();

    const result = await handleTrajectorySearch('TYPE_B' as TRAJECTORY_TYPE, 'value', 'area', setDbTrajectories, {
      horizon: '2030',
    } as StudyDTO);

    expect(result).toBeUndefined();
    expect(setDbTrajectories).not.toHaveBeenCalled();
  });
});

describe('addRow', () => {
  beforeEach(() => {
    Math.random = vi.fn(() => 1);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should dispatch action and update state without subRows', () => {
    const mockDispatch = vi.fn();
    const mockSetCheckedValues = vi.fn<Dispatch<SetStateAction<string[]>>>();
    const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();

    addRow(TRAJECTORY_TYPE.LOAD, 'NewHypothesis', mockDispatch, mockSetCheckedValues, mockSetData);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.ADD_TRAJECTORIES,
      payload: {
        [TRAJECTORY_TYPE.LOAD]: {
          trajectories: [
            {
              id: 'DEMAND-NewHypothesis',
              trajectoryName: '',
              type: TRAJECTORY_TYPE.LOAD,
              version: 0,
              userName: 'user',
              creationDate: new Date(),
              area: 'NewHypothesis',
              technology: '',
              state: TRAJECTORY_SELECTION_STATUS.MISSING,
            },
          ],
          warningMessages: [],
        },
      },
    });

    expect(mockSetCheckedValues).toHaveBeenCalled();
    expect(mockSetData).toHaveBeenCalled();

    const updater = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const newRow = updater([]);
    expect(newRow[0]).toMatchObject({
      hypothesis: 'NewHypothesis',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      subRows: null,
    });
  });

  it('should include subRows for THERMAL_CAPACITY type', () => {
    const mockDispatch = vi.fn();
    const mockSetCheckedValues = vi.fn<Dispatch<SetStateAction<string[]>>>();
    const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();

    addRow(TRAJECTORY_TYPE.THERMAL_CAPACITY, 'ThermalHypothesis', mockDispatch, mockSetCheckedValues, mockSetData);

    const updater = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const newRow = updater([]);
    expect(newRow[0].subRows).toHaveLength(ThermalOptions.length);
    expect(newRow[0].subRows?.[0]).toMatchObject({
      hypothesis: ThermalOptions[0],
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: true,
      subRows: null,
    });
  });

  it('should not crash if dispatch is null', () => {
    const mockSetCheckedValues = vi.fn<Dispatch<SetStateAction<string[]>>>();
    const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();

    expect(() => addRow(TRAJECTORY_TYPE.LOAD, 'SafeHypothesis', null, mockSetCheckedValues, mockSetData)).not.toThrow();

    expect(mockSetCheckedValues).toHaveBeenCalled();
    expect(mockSetData).toHaveBeenCalled();
  });
});
