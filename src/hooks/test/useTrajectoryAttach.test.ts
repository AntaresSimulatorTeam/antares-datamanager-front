import { describe, expect, it, Mock, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { DbTrajectory, HypothesisRowData, StudyDTO, UserState } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import { useTrajectoryAttach } from '@/hooks/useTrajectoryAttach.ts';
import { handleTrajectoryError } from '@/shared/services/hypothesisTableService.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { ReadOnlyObject } from '@/shared/types/HypothesisTable.ts';
import { Dispatch, SetStateAction } from 'react';

vi.mock('@/shared/services/trajectoryService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    getStudyTrajectoriesWithWarnings: vi.fn(),
    linkTrajectoryToStudy: vi.fn(),
    isParamModulationRequired: vi.fn(),
  };
});

vi.mock('@/shared/services/studyService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    getStudyTrajectories: vi.fn(),
  };
});

vi.mock('@/shared/utils/trajectoryUtils', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    isUniqueTrajectoryType: vi.fn(),
    setNestedData: vi.fn(),
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

describe('useTrajectoryAttach', () => {
  const mockDispatch = vi.fn();
  const mockSetData = vi.fn();
  const mockSetReadOnly = vi.fn();

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

  // const studyState: Partial<StudyState> = {
  //   [TRAJECTORY_TYPE.LOAD]: {
  //     trajectories: [{ area: 'Zone A', type: TRAJECTORY_TYPE.LOAD } as DbTrajectory],
  //   },
  // };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should dispatch UPDATE_TRAJECTORY on attach', async () => {
    vi.mocked(trajectoryService.linkTrajectoryToStudy as ReturnType<typeof vi.fn>).mockResolvedValue(newTrajectory);

    const { result } = renderHook(() => useTrajectoryAttach(study, mockDispatch));

    await result.current.attachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'success', trajectory, mockSetData, mockSetReadOnly);

    expect(trajectoryService.linkTrajectoryToStudy).toHaveBeenCalledWith(TRAJECTORY_TYPE.LOAD, 42, 'study-001');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: newTrajectory,
        status: 'success',
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should dispatch UPDATE_TRAJECTORY even if not already in state', async () => {
    //const emptyState: Partial<StudyState> = {};
    vi.mocked(trajectoryService.linkTrajectoryToStudy as ReturnType<typeof vi.fn>).mockResolvedValue(newTrajectory);

    const { result } = renderHook(() => useTrajectoryAttach(study, mockDispatch));

    await result.current.attachTrajectory(TRAJECTORY_TYPE.LOAD, [1], 'success', trajectory, mockSetData, mockSetReadOnly);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: newTrajectory,
        status: 'success',
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should dispatch UPDATE_TRAJECTORY for unique type', async () => {
    const mockTrajectory = { id: '123', type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER };
    const newTrajectory2 = {
      id: '123',
      trajectoryName: 'Traj A',
      area: 'Zone A',
      type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
    } as unknown as DbTrajectory;
    // const studyState2: Partial<StudyState> = {
    //   [TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER]: {
    //     trajectories: [
    //       { area: 'Zone A', type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER } as DbTrajectory,
    //     ],
    //   },
    // };
    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockResolvedValue(mockTrajectory as unknown as DbTrajectory);

    const { result } = renderHook(() => useTrajectoryAttach(study, mockDispatch));

    await result.current.attachTrajectory(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
      [0],
      'success',
      newTrajectory2,
      mockSetData,
      mockSetReadOnly
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: mockTrajectory,
        status: 'success',
      },
    });
    expect(mockSetData).toHaveBeenCalled();
  });

  it('should handle error and call handleTrajectoryError', async () => {
    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockRejectedValue(new Error('link failed'));

    const { result } = renderHook(() => useTrajectoryAttach(study, mockDispatch));

    await result.current.attachTrajectory(TRAJECTORY_TYPE.LOAD, [0], 'success', trajectory, mockSetData, mockSetReadOnly);

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
    const { result } = renderHook(() => useTrajectoryAttach(study, mockDispatch));

    const trajectoryArea = {
      id: 100,
      trajectoryName: 'BP23_A_ref_v2',
      type: TRAJECTORY_TYPE.AREA,
      version: 1,
      userName: '',
      technology: '',
      creationDate: '2025-08-07T14:17:09.895028' as unknown as Date,
    } as DbTrajectory;

    await result.current.attachTrajectory(TRAJECTORY_TYPE.AREA, [0], 'success', trajectoryArea, mockSetData, mockSetReadOnly);

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

  it('attache une trajectoire thermique spécifique et met à jour readOnly selon isParamModulationRequired', async () => {
    const studyThermal = { id: 1, horizon: 2030 } as unknown as StudyDTO;
    // const studyStateThermal = {
    //   THERMAL_TECHNICAL_SPECIFIC_PARAMETER: { trajectories: [] },
    // } as StudyState;

    const dispatch = vi.fn();
    const setData: Dispatch<SetStateAction<HypothesisRowData[]>> = vi.fn((fn: SetStateAction<HypothesisRowData[]>) => {
      const prev = [{ hypothesis: 'FR' }] as HypothesisRowData[];
      // Si fn est une fonction, on l'exécute
      if (typeof fn === 'function') {
        return (fn as (prev: HypothesisRowData[]) => HypothesisRowData[])(prev);
      }
      // Sinon, c'est une valeur directe
      return fn;
    });

    const newTrajectoryThermal = {
      id: 10,
      type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
    } as unknown as DbTrajectory;

    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockResolvedValue(newTrajectory);
    vi.mocked(trajectoryService.isParamModulationRequired).mockResolvedValue(true);
    vi.mocked(trajectoryUtils.setNestedData).mockReturnValue([
      { hypothesis: 'FR', status: TRAJECTORY_SELECTION_STATUS.OK },
    ] as HypothesisRowData[]);

    const { result } = renderHook(() => useTrajectoryAttach(studyThermal, dispatch));

    await act(async () => {
      await result.current.attachTrajectory(
        TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
        [0, 1],
        'success',
        newTrajectoryThermal,
        setData,
        mockSetReadOnly
      );
    });

    // Vérifie l'appel backend
    expect(trajectoryService.linkTrajectoryToStudy).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      10,
      1,
    );

    // Vérifie la logique métier
    expect(trajectoryService.isParamModulationRequired).toHaveBeenCalledWith(1, 2030);

    // Vérifie la mise à jour des données
    expect(trajectoryUtils.setNestedData).toHaveBeenCalled();
    expect(mockSetReadOnly).toHaveBeenCalledWith(expect.any(Function));

    // Vérifie que readOnly est mis à jour avec !isRequired
    const readOnlyUpdater = mockSetReadOnly.mock.calls[0][0] as (prev: ReadOnlyObject) => ReadOnlyObject;
    const updatedReadOnly = readOnlyUpdater({ '1': false });
    expect(updatedReadOnly).toEqual({ '1': false }); // car isRequired = true → !true = false

    // Vérifie le dispatch ADD
    expect(dispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: newTrajectory,
        status: 'success'
      },
    });
  });

  it('update la trajectoire si elle existe déjà', async () => {
    const studySpecific = { id: 1, horizon: 2030 } as unknown as StudyDTO;

    const dispatch = vi.fn();
    const setData: Dispatch<SetStateAction<HypothesisRowData[]>> = vi.fn((fn: SetStateAction<HypothesisRowData[]>) => {
      const prev = [{ hypothesis: 'FR' }] as HypothesisRowData[];
      // Si fn est une fonction, on l'exécute
      if (typeof fn === 'function') {
        return (fn as (prev: HypothesisRowData[]) => HypothesisRowData[])(prev);
      }
      // Sinon, c'est une valeur directe
      return fn;
    });

    const newTrajectorySpecific = {
      id: 10,
      type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      area: 'FR',
    } as DbTrajectory;

    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockResolvedValue(newTrajectorySpecific);
    vi.mocked(trajectoryService.isParamModulationRequired).mockResolvedValue(false);
    vi.mocked(trajectoryUtils.setNestedData).mockReturnValue([
      { hypothesis: 'FR', status: TRAJECTORY_SELECTION_STATUS.OK },
    ] as HypothesisRowData[]);

    const { result } = renderHook(() => useTrajectoryAttach(studySpecific, dispatch));

    await act(async () => {
      await result.current.attachTrajectory(
        TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
        [0],
        'success',
        newTrajectorySpecific,
        setData,
        mockSetReadOnly
      );
    });

    // Vérifie que UPDATE est appelé
    expect(dispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: newTrajectorySpecific,
        status: 'success',
      },
    });

    // Vérifie readOnly = !isRequired = !false = true
    const readOnlyUpdater = mockSetReadOnly.mock.calls[0][0] as (prev: ReadOnlyObject) => ReadOnlyObject;
    const updated = readOnlyUpdater({ '1': false });
    expect(updated).toEqual({ '1': true });
  });

  it('met à jour les données et setReadOnly pour le type AREA', async () => {
    const studyArea = { id: 1 } as StudyDTO;

    const dispatch = vi.fn();
    const setData: Dispatch<SetStateAction<HypothesisRowData[]>> = vi.fn((fn: SetStateAction<HypothesisRowData[]>) => {
      const prev = [{ hypothesis: 'FR' }] as HypothesisRowData[];
      // Si fn est une fonction, on l'exécute
      if (typeof fn === 'function') {
        return (fn as (prev: HypothesisRowData[]) => HypothesisRowData[])(prev);
      }
      // Sinon, c'est une valeur directe
      return fn;
    });

    const newTrajectoryArea = {
      id: 10,
      type: TRAJECTORY_TYPE.AREA,
    } as DbTrajectory;

    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockResolvedValue(newTrajectoryArea);
    vi.mocked(trajectoryUtils.setNestedData).mockReturnValue([{ updated: true }] as unknown as HypothesisRowData[]);

    const { result } = renderHook(() => useTrajectoryAttach(studyArea, dispatch));

    await act(async () => {
      await result.current.attachTrajectory(TRAJECTORY_TYPE.AREA, [0], 'success', newTrajectoryArea, setData, mockSetReadOnly);
    });

    // Vérifie la mise à jour des données
    expect(trajectoryUtils.setNestedData).toHaveBeenCalled();

    // Vérifie setReadOnly
    expect(mockSetReadOnly).toHaveBeenCalledWith({ '0': false, '1': false });

    // Vérifie le dispatch ADD
    expect(dispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
          trajectory: newTrajectoryArea,
          status: 'success'
      },
    });
  });

  it('met à jour readOnly pour DSR selon hasTimeSeries = true', async () => {
    const studyDSR = { id: 1 } as StudyDTO;

    const dispatch = vi.fn();
    const setData: Dispatch<SetStateAction<HypothesisRowData[]>> = vi.fn((fn: SetStateAction<HypothesisRowData[]>) => {
      const prev = [
        { status: TRAJECTORY_SELECTION_STATUS.ERROR },
        { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { hasTimeSeries: false } },
      ] as HypothesisRowData[];
      // Si fn est une fonction, on l'exécute
      if (typeof fn === 'function') {
        return (fn as (prev: HypothesisRowData[]) => HypothesisRowData[])(prev);
      }
      // Sinon, c'est une valeur directe
      return fn;
    });

    const newTrajectoryDsr = {
      id: 10,
      type: TRAJECTORY_TYPE.DSR,
      hasTimeSeries: true,
    } as unknown as DbTrajectory;

    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockResolvedValue(newTrajectoryDsr);
    vi.mocked(trajectoryUtils.setNestedData).mockReturnValue([
      { status: TRAJECTORY_SELECTION_STATUS.ERROR },
      { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { hasTimeSeries: false } },
      { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { hasTimeSeries: true } },
    ] as HypothesisRowData[]);

    const { result } = renderHook(() => useTrajectoryAttach(studyDSR, dispatch));

    await act(async () => {
      await result.current.attachTrajectory(TRAJECTORY_TYPE.DSR, [1], 'success', newTrajectoryDsr, setData, mockSetReadOnly);
    });

    // Vérifie setNestedData
    expect(trajectoryUtils.setNestedData).toHaveBeenCalled();

    // Vérifie que setReadOnly est appelé avec une fonction
    expect(mockSetReadOnly).toHaveBeenCalledWith(expect.any(Function));

    // On exécute la fonction pour vérifier le résultat
    const updater = mockSetReadOnly.mock.calls[0][0] as (prev: ReadOnlyObject) => ReadOnlyObject;
    const updated = updater({ 0: true, 1: true });

    // hasTimeSeries = true → readOnly[lastIndex] = false
    expect(updated).toEqual({ 0: true, 1: false });
  });

  it('met à jour readOnly pour DSR selon hasTimeSeries = false', async () => {
    const studyDSR2 = { id: 1 } as StudyDTO;

    const dispatch = vi.fn();
    const setData: Dispatch<SetStateAction<HypothesisRowData[]>> = vi.fn((fn: SetStateAction<HypothesisRowData[]>) => {
      const prev = [
        { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { hasTimeSeries: false } },
      ] as HypothesisRowData[];
      // Si fn est une fonction, on l'exécute
      if (typeof fn === 'function') {
        return (fn as (prev: HypothesisRowData[]) => HypothesisRowData[])(prev);
      }
      // Sinon, c'est une valeur directe
      return fn;
    });

    const newTrajectoryDSR2 = {
      id: 10,
      type: TRAJECTORY_TYPE.DSR,
      hasTimeSeries: false,
    } as DbTrajectory;

    vi.mocked(trajectoryService.linkTrajectoryToStudy).mockResolvedValue(newTrajectoryDSR2);
    vi.mocked(trajectoryUtils.setNestedData).mockReturnValue([
      { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { hasTimeSeries: false } },
      { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { hasTimeSeries: false } },
    ] as HypothesisRowData[]);

    const { result } = renderHook(() => useTrajectoryAttach(studyDSR2, dispatch));

    await act(async () => {
      await result.current.attachTrajectory(TRAJECTORY_TYPE.DSR, [0], 'success', newTrajectoryDSR2, setData, mockSetReadOnly);
    });

    expect(mockSetReadOnly).toHaveBeenCalledWith(expect.any(Function));

    const updater = mockSetReadOnly.mock.calls[0][0] as (prev: ReadOnlyObject) => ReadOnlyObject;
    const updated = updater({ 0: false });

    // hasTimeSeries = false → readOnly[lastIndex] = true
    expect(updated).toEqual({ 0: true });
  });
});
