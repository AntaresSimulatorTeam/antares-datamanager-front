import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import {
  addRow,
  fetchMultipleTrajectoryType,
  fetchTrajectoriesFromTypes,
  handleFetchTrajectoriesFS,
  handleTrajectoryError,
  handleTrajectorySearch,
  handleViewTrajectory,
} from '@/shared/services/hypothesisTableService.ts';
import {
  DbTrajectory,
  FsTrajectory,
  HypothesisRowData,
  SelectOption,
  StudyDTO,
  ThermalParamTrajectoryType,
} from '@/shared/types';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import { getStudyTrajectoriesWithWarnings, getTrajectoryDataByTypeAndId } from '@/shared/services/trajectoryService.ts';
import * as formFormatter from '@/shared/utils/formFormatter';
import { STSTechnology, ThermalOptions } from '@/mocks/data/list/names.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { Dispatch, SetStateAction } from 'react';
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { getStudyTrajectories } from '@/shared/services/studyService.ts';
import { generateTrajectoryViewHeader } from '@/components/header/TrajectoryViewHeader.tsx';
import { TFunction } from 'i18next';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';

vi.mock('@/shared/notification/notification');

vi.mock('@/shared/utils/defaultUtils.ts', () => ({
  generateId: vi.fn(() => 'DEMAND-NewHypothesis'),
}));

vi.mock('@/components/header/TrajectoryViewHeader.tsx', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    generateTrajectoryViewHeader: vi.fn(),
  };
});

vi.mock('@/shared/services/trajectoryService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    fetchTrajectoriesFromFS: vi.fn(),
    fetchTrajectoriesFromDB: vi.fn(),
    getStudyTrajectoriesWithWarnings: vi.fn(),
    getTrajectoryDataByTypeAndId: vi.fn(),
  };
});

vi.mock('@/shared/services/studyService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    getStudyTrajectories: vi.fn(),
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

const mockResults = [{ id: 1, label: 'Trajectory A' }] as unknown as FsTrajectory[];
const mockConvertedOptions = [{ value: '1', label: 'Trajectory A' }] as unknown as SelectOption[];
const mockResultsArray = [{ id: 1, label: 'Trajectory A' }] as unknown as FsTrajectory[];
const mockConvertedOptionsArray = [{ value: '1', label: 'Trajectory A' }] as unknown as SelectOption[];

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
      icon: 'close',
      message: alert.message,
      content: alert.content,
      type: 'error',
      filledIcon: true,
    });
  });
});

describe('handleFetchTrajectoriesFS', () => {
  it('should fetch trajectories and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.LOAD;
    const rowId = 'row-123';
    const hypothesis = 'Hypothesis X';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, hypothesis);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for OTHERS area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResultsArray);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptionsArray);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.LOAD;
    const rowId = 'row-123';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, OTHER_AREAS_LABEL);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, OTHER_AREAS);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for THERMAL CAPACITY area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResultsArray);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptionsArray);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.THERMAL_CAPACITY;
    const rowId = 'row-123';
    const hypothesis = 'FR';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, 'FR');
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for THERMAL CAPACITY OTHERS area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResultsArray);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptionsArray);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.THERMAL_CAPACITY;
    const rowId = 'row-123';
    const hypothesis = 'CZ';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, hypothesis);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for OTHERS area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.LOAD;
    const rowId = 'row-123';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, OTHER_AREAS_LABEL);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, OTHER_AREAS);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for THERMAL CAPACITY area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.THERMAL_CAPACITY;
    const rowId = 'row-123';
    const hypothesis = 'FR Default';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, 'FR');
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for THERMAL CAPACITY OTHERS area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.THERMAL_CAPACITY;
    const rowId = 'row-123';
    const hypothesis = 'CZ';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, hypothesis);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for OTHERS area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.LOAD;
    const rowId = 'row-123';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, OTHER_AREAS_LABEL);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, OTHER_AREAS);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for THERMAL CAPACITY area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.THERMAL_CAPACITY;
    const rowId = 'row-123';
    const hypothesis = 'FR Default';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, 'FR');
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should fetch trajectories for THERMAL CAPACITY OTHERS area and update state correctly', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.THERMAL_CAPACITY;
    const rowId = 'row-123';
    const hypothesis = 'CZ';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal, hypothesis);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type, hypothesis);
    expect(formFormatter.convertToFSSelectionOptionType).toHaveBeenCalledWith(mockResults, false);
    expect(setOptionsFS).toHaveBeenCalledWith(mockConvertedOptions);
    expect(setRowIdSelected).toHaveBeenCalledWith(rowId);
    expect(toggleModal).toHaveBeenCalled();
  });

  it('should call fetchTrajectoriesFromFS without area when no hypothesis is provided', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromFS).mockResolvedValueOnce(mockResults);
    vi.mocked(formFormatter.convertToFSSelectionOptionType).mockReturnValue(mockConvertedOptions);

    // Mocks
    const setOptionsFS = vi.fn();
    const setRowIdSelected = vi.fn();
    const toggleModal = vi.fn();

    const type = TRAJECTORY_TYPE.LOAD;
    const rowId = 'row-123';

    await handleFetchTrajectoriesFS(type, rowId, setOptionsFS, setRowIdSelected, toggleModal);

    expect(trajectoryService.fetchTrajectoriesFromFS).toHaveBeenCalledWith(type);
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
  const mockResultsArraySearch = [
    { id: 1, label: 'Trajectory A' },
    { id: 2, label: 'Trajectory B' },
  ] as unknown as DbTrajectory[];
  const mockConvertedOptionsArraySearch = [
    { value: '1', label: 'Trajectory A' },
    { value: '2', label: 'Trajectory B' },
  ] as unknown as SelectOption[];
  it('should fetch trajectories and return converted options', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromDB).mockResolvedValue(mockResultsArraySearch);
    vi.mocked(formFormatter.convertToSelectionOptionType).mockReturnValue(mockConvertedOptionsArraySearch);
    const setDbTrajectories = vi.fn();

    const type = TRAJECTORY_TYPE.STS;
    const value = 'searchValue';
    const area = 'Area51';
    const technology = 'biomass';
    const study = { horizon: '2025' } as StudyDTO;

    const result = await handleTrajectorySearch(type, setDbTrajectories, study.horizon, {
      area,
      technology,
      fileNameContains: value,
    });

    expect(trajectoryService.fetchTrajectoriesFromDB).toHaveBeenCalledWith(type, study.horizon, {
      area,
      technology,
      fileNameContains: value,
    });
    expect(setDbTrajectories).toHaveBeenCalledWith(mockResultsArraySearch);
    expect(formFormatter.convertToSelectionOptionType).toHaveBeenCalledWith(mockResultsArraySearch);
    expect(result).toEqual(mockConvertedOptionsArraySearch);
  });

  it('should fetch trajectories for OTHERS area when hypothesis is Other areas', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromDB).mockResolvedValue(mockResultsArraySearch);
    vi.mocked(formFormatter.convertToSelectionOptionType).mockReturnValue(mockConvertedOptionsArraySearch);
    const setDbTrajectories = vi.fn();

    const type = TRAJECTORY_TYPE.STS;
    const value = 'valueToSearch';
    const area = OTHER_AREAS_LABEL;
    const study = { horizon: '2031' } as StudyDTO;

    await handleTrajectorySearch(type, setDbTrajectories, study.horizon, {
      area,
      fileNameContains: value,
    });

    expect(trajectoryService.fetchTrajectoriesFromDB).toHaveBeenCalledWith(type, study.horizon, {
      area: OTHER_AREAS,
      fileNameContains: value,
    });
  });

  it('should handle errors silently and return undefined', async () => {
    vi.mocked(trajectoryService.fetchTrajectoriesFromDB).mockRejectedValue(new Error('DB error'));
    const setDbTrajectories = vi.fn();

    const result = await handleTrajectorySearch('TYPE_B' as TRAJECTORY_TYPE, setDbTrajectories, '2030', {
      fileNameContains: 'value',
      area: 'area',
    });

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
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should dispatch action and update state for LOAD type', () => {
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
              hasTimeSeries: false,
            },
          ],
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
      subRows: [],
    });
  });

  it('should include subRows for THERMAL_CAPACITY type', () => {
    const mockDispatch = vi.fn();
    const mockSetCheckedValues = vi.fn<Dispatch<SetStateAction<string[]>>>();
    const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();

    addRow(
      TRAJECTORY_TYPE.THERMAL_CAPACITY,
      'ThermalHypothesis',
      mockDispatch,
      mockSetCheckedValues,
      mockSetData,
      ThermalOptions,
    );

    const updater = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const newRow = updater([]);
    expect(newRow[0].subRows).toHaveLength(ThermalOptions.length);
    expect(newRow[0].subRows?.[0]).toMatchObject({
      hypothesis: ThermalOptions[0],
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
      subRows: null,
    });
  });

  it('should include subRows for THERMAL_TECHNICAL_SPECIFIC_PARAMETER type', () => {
    const mockDispatch = vi.fn();
    const mockSetCheckedValues = vi.fn<Dispatch<SetStateAction<string[]>>>();
    const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();

    const existingSubRow = [
      {
        hypothesis: 'FR',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: true,
        subRows: null,
      },
    ];
    const prevData = [
      {
        hypothesis: 'specific',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
        isDeletable: false,
        subRows: existingSubRow,
      },
      {
        hypothesis: 'paramModulation',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
        isDeletable: false,
      },
      {
        hypothesis: 'common',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
        isDeletable: false,
      },
    ] as unknown as HypothesisRowData[];

    addRow(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      'ThermalHypothesis',
      mockDispatch,
      mockSetCheckedValues,
      mockSetData,
    );

    const updater = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const newRow = updater(prevData);
    expect(newRow[0].subRows).toHaveLength(2);
    expect(newRow[0].subRows?.[1]).toMatchObject({
      hypothesis: 'ThermalHypothesis',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      subRows: [],
    });
  });

  it('should not include subRows for THERMAL_TECHNICAL_SPECIFIC_PARAMETER type', () => {
    const mockDispatch = vi.fn();
    const mockSetCheckedValues = vi.fn<Dispatch<SetStateAction<string[]>>>();
    const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();
    const prevData = [
      {
        hypothesis: 'specific',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
        isDeletable: false,
        subRows: null,
      },
      {
        hypothesis: 'paramModulation',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
        isDeletable: false,
      },
      {
        hypothesis: 'common',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        isDefault: false,
        isDeletable: false,
      },
    ] as unknown as HypothesisRowData[];

    addRow(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      'ThermalHypothesis',
      mockDispatch,
      mockSetCheckedValues,
      mockSetData,
    );

    const updater = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const newRow = updater(prevData);
    expect(newRow[0].subRows).toHaveLength(1);
  });

  it('should include subRows for STS type', () => {
    const mockDispatch = vi.fn();
    const mockSetCheckedValues = vi.fn<Dispatch<SetStateAction<string[]>>>();
    const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();

    addRow(TRAJECTORY_TYPE.STS, 'STSHypothesis', mockDispatch, mockSetCheckedValues, mockSetData, STSTechnology);

    const updater = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];

    const newRow = updater([]);
    expect(newRow[0]?.subRows).toHaveLength(STSTechnology.length);
    expect(newRow[0].subRows?.[0]).toMatchObject({
      hypothesis: STSTechnology[0],
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      isDeletable: false,
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

  it('should add item and keep last item et call setReadOnly through computeDsrDataAndReadOnly', () => {
    // Arrange
    const value = 'AREA_1';

    const mockDispatch = vi.fn();
    const mockSetCheckedValues = vi.fn<Dispatch<SetStateAction<string[]>>>();
    const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();
    const mockSetReadOnly = vi.fn<Dispatch<SetStateAction<ReadOnlyObject>>>();

    // Act
    addRow(TRAJECTORY_TYPE.DSR, value, mockDispatch, mockSetCheckedValues, mockSetData, [], [], mockSetReadOnly);
    const updater = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const newRow = updater([]);
    // Assert dispatch
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.ADD_TRAJECTORIES,
      payload: {
        [TRAJECTORY_TYPE.DSR]: {
          trajectories: [
            {
              id: 'DEMAND-NewHypothesis',
              trajectoryName: '',
              type: TRAJECTORY_TYPE.DSR,
              version: 0,
              userName: 'user',
              creationDate: new Date(),
              area: value,
              technology: '',
              state: TRAJECTORY_SELECTION_STATUS.MISSING,
              hasTimeSeries: false,
            },
          ],
        },
      },
    });
    expect(newRow[0]).toMatchObject({
      hypothesis: value,
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      isDefault: false,
      subRows: [],
    });
  });
});

describe('fetchMultipleTrajectoryType', () => {
  const mockedGetStudyTrajectoriesWithWarnings = getStudyTrajectoriesWithWarnings as ReturnType<typeof vi.fn>;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch trajectories for all types and return a mapped object', async () => {
    const studyId = 42;
    const types: ThermalParamTrajectoryType[] = [
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    ];

    mockedGetStudyTrajectoriesWithWarnings.mockImplementation(async (_studyId, type) =>
      Promise.resolve({ data: `result-for-${type}` }),
    );

    const result = await fetchMultipleTrajectoryType(studyId, types);

    expect(mockedGetStudyTrajectoriesWithWarnings).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER]: { data: 'result-for-THERMAL_TECHNICAL_COMMON_PARAMETER' },
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]: {
        data: 'result-for-THERMAL_TECHNICAL_SPECIFIC_PARAMETER',
      },
    });
  });

  it('should throw an error if one of the calls fails', async () => {
    const id = 42;
    const types: ThermalParamTrajectoryType[] = [
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_COMMON_PARAMETER,
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    ];

    mockedGetStudyTrajectoriesWithWarnings.mockRejectedValueOnce({
      message: 'Failed to fetch',
    });

    await expect(fetchMultipleTrajectoryType(id, types)).rejects.toThrow('Failed to fetch');
  });
});

describe('fetchTrajectoriesFromTypes', () => {
  const mockedGetStudyTrajectories = getStudyTrajectories as unknown as ReturnType<typeof vi.fn>;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch trajectories for each type and return a result object', async () => {
    const id = 42;
    const types = [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER, TRAJECTORY_TYPE.LOAD];

    const mockData = [
      { id: 1, trajectoryName: 'trajectory1' },
      { id: 2, trajectoryName: 'trajectory2' },
    ] as DbTrajectory[];
    mockedGetStudyTrajectories.mockResolvedValue(mockData);

    const result = await fetchTrajectoriesFromTypes(id, types);

    expect(mockedGetStudyTrajectories).toHaveBeenCalledTimes(types.length);
    expect(mockedGetStudyTrajectories).toHaveBeenCalledWith(id, TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER);
    expect(mockedGetStudyTrajectories).toHaveBeenCalledWith(id, TRAJECTORY_TYPE.LOAD);
    expect(result).toEqual({
      [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: mockData,
      [TRAJECTORY_TYPE.LOAD]: mockData,
    });
  });

  it('should return undefined if an error occurs', async () => {
    mockedGetStudyTrajectories.mockRejectedValueOnce(new Error('fail'));

    const result = await fetchTrajectoriesFromTypes(1, [TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER]);

    expect(result).toBeUndefined();
  });
});

describe('handleViewTrajectory', () => {
  const mockedGetTrajectoryData = getTrajectoryDataByTypeAndId as unknown as ReturnType<typeof vi.fn>;
  const mockedGenerateHeader = generateTrajectoryViewHeader as unknown as ReturnType<typeof vi.fn>;

  const mockTrajectory = {
    id: 1,
    type: TRAJECTORY_TYPE.AREA,
  } as DbTrajectory;

  const mockResultsVien = [
    { id: 'row1', type: TRAJECTORY_TYPE.AREA },
    { id: 'row2', type: TRAJECTORY_TYPE.AREA },
  ] as unknown as DbTrajectory[];
  const mockColumns = [{ Header: 'Col1', accessor: 'col1' }];

  const mockSetTrajectoryData = vi.fn();
  const mockSetIsViewModalOpen = vi.fn();
  const mockT = vi.fn((key: string) => key) as unknown as TFunction<'translation', undefined>;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data and set trajectory view for AREA type', async () => {
    mockedGetTrajectoryData.mockResolvedValue(mockResultsVien);
    mockedGenerateHeader.mockReturnValue(mockColumns);

    await handleViewTrajectory(mockTrajectory, mockSetTrajectoryData, mockSetIsViewModalOpen, mockT);

    expect(mockedGetTrajectoryData).toHaveBeenCalledWith(mockTrajectory.type, mockTrajectory.id);
    expect(mockedGenerateHeader).toHaveBeenCalledWith(expect.anything(), mockT, 350);
    expect(mockSetTrajectoryData).toHaveBeenCalledWith({
      trajectory: mockTrajectory,
      data: mockResultsVien,
      columns: mockColumns,
    });
    expect(mockSetIsViewModalOpen).toHaveBeenCalledWith(true);
  });

  it('should fetch data and set trajectory view for LINK type', async () => {
    const mockTrajectoryLink = {
      id: 1,
      type: TRAJECTORY_TYPE.LINK,
    } as DbTrajectory;

    const mockResultsLinkVien = [
      { id: 'row1', type: TRAJECTORY_TYPE.LINK },
      { id: 'row2', type: TRAJECTORY_TYPE.LINK },
    ];
    mockedGetTrajectoryData.mockResolvedValue(mockResultsLinkVien);
    mockedGenerateHeader.mockReturnValue(mockColumns);

    await handleViewTrajectory(mockTrajectoryLink, mockSetTrajectoryData, mockSetIsViewModalOpen, mockT);

    expect(mockedGetTrajectoryData).toHaveBeenCalledWith(mockTrajectoryLink.type, mockTrajectoryLink.id);
    expect(mockedGenerateHeader).toHaveBeenCalledWith(expect.anything(), mockT, 128);
    expect(mockSetTrajectoryData).toHaveBeenCalledWith({
      trajectory: mockTrajectoryLink,
      data: mockResultsLinkVien,
      columns: mockColumns,
    });
    expect(mockSetIsViewModalOpen).toHaveBeenCalledWith(true);
  });

  it('should silently fail on error', async () => {
    vi.mocked(trajectoryService.getTrajectoryDataByTypeAndId).mockRejectedValueOnce(new Error('fail'));

    await handleViewTrajectory(mockTrajectory, mockSetTrajectoryData, mockSetIsViewModalOpen, mockT);

    expect(mockSetTrajectoryData).not.toHaveBeenCalled();
    expect(mockSetIsViewModalOpen).not.toHaveBeenCalled();
  });
});
