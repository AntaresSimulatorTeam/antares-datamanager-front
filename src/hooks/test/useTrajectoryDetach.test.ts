import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTrajectoryDetach } from '@/hooks/useTrajectoryDetach';
import { useTrajectoryDeletionLogic } from '@/hooks/useTrajectoryDeletionLogic';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import * as hypothesisTableHelper from '@/shared/helpers/hypothesisTableHelper.ts';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import * as studyService from '@/shared/services/studyService';
import { Dispatch, SetStateAction } from 'react';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

vi.mock('@/hooks/useTrajectoryDeletionLogic', () => ({
  useTrajectoryDeletionLogic: vi.fn(),
}));

vi.mock('@/shared/helpers/hypothesisTableHelper.ts', () => ({
  updateTableAfterCellDetach: vi.fn(),
}));

vi.mock('@/shared/notification/notification', () => ({
  notifyAlert: vi.fn(),
}));

vi.mock('@/shared/services/hypothesisTableService.ts', () => ({
  handleTrajectoryError: vi.fn(),
}));

vi.mock('@/shared/services/studyService');

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn().mockImplementation((key: string) => key),
  }),
}));

vi.mock('@/store/contexts/UserContext.tsx', () => ({
  useUser: () => ({
    user: { profile: { sub: 'user-123' } },
  }),
}));

describe('useTrajectoryDetach', () => {
  const study: StudyDTO = {
    id: 1,
    horizon: '2030',
    name: 'Study X',
    createdBy: undefined,
    creationDate: new Date('2026-01-01'),
    keywords: [],
    project: 'Project',
    projectId: '1',
    status: StudyStatus.IN_PROGRESS,
    trajectoryIds: [],
    hvdc: true,
    recalculate: true,
  };

  const mockDispatch = vi.fn();
  const mockSetReadOnly = vi.fn<Dispatch<SetStateAction<Record<string, boolean>>>>();
  const mockSetData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();
  const mockSetSecondData = vi.fn<Dispatch<SetStateAction<HypothesisRowData[]>>>();
  const mockSetSecondTableReadOnly = vi.fn();
  const mockSetRowIdSelected = vi.fn();
  const mockSetIsDeletionModalOpen = vi.fn();

  const sampleData = [
    {
      hypothesis: 'H1',
      trajectory: { id: 10, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: false },
      status: 'OK',
    },
    {
      hypothesis: 'H2',
      trajectory: { id: 20, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: false },
      status: 'OK',
    },
  ] as HypothesisRowData[];

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(hypothesisTableHelper.updateTableAfterCellDetach).mockResolvedValue({
      newData: [{ hypothesis: 'H1' }] as HypothesisRowData[],
      newReadOnly: { 1: true },
    });
  });

  // --------------------------------------------------------------------
  //  TEST 1 : Détachement OK
  // --------------------------------------------------------------------
  it('détache correctement une trajectoire dont le type est DSR', async () => {
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
        },
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockResolvedValue(undefined),
    });
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

    await act(async () => {
      await result.current.detachTrajectory({
        type: TRAJECTORY_TYPE.DSR,
        indexArray: [0],
        setData: mockSetData,
        data: sampleData,
        status: 'empty',
        hypothesis: 'H1',
        setReadOnly: mockSetReadOnly,
      });
    });

    // computeDeletion appelé
    expect(useTrajectoryDeletionLogic(study).computeDeletion).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.DSR,
      sampleData,
      null,
      [0],
      'H1',
      'empty',
      undefined,
    );

    // performBackendDeletion appelé
    expect(useTrajectoryDeletionLogic(study).performBackendDeletion).toHaveBeenCalledWith([10]);

    // dispatch appelé
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.UPDATE_TRAJECTORY,
      payload: {
        trajectory: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
        },
        status: 'empty',
      },
    });

    // updateTableAfterCellDetach appelé
    expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalled();

    // setData mis à jour
    expect(mockSetData).toHaveBeenCalledWith([{ hypothesis: 'H1' }]);

    // setReadOnly mis à jour
    expect(mockSetReadOnly).toHaveBeenCalled();
  });

  it('détache correctement une trajectoire dont le type est AREA', async () => {
    const trajectoryToDelete = {
      id: 10,
      area: 'AREA_X',
      trajectoryName: 'Traj X',
      type: TRAJECTORY_TYPE.AREA,
    };
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete,
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockResolvedValue(undefined),
    });
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

    await act(async () => {
      await result.current.detachTrajectory({
        type: TRAJECTORY_TYPE.AREA,
        indexArray: [0],
        setData: mockSetData,
        data: sampleData,
        status: 'empty',
        hypothesis: 'H1',
        setReadOnly: mockSetReadOnly,
        setSecondTableReadOnly: mockSetSecondTableReadOnly,
      });
    });

    // computeDeletion appelé
    expect(useTrajectoryDeletionLogic(study).computeDeletion).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.AREA,
      sampleData,
      null,
      [0],
      'H1',
      'empty',
      undefined,
    );

    // performBackendDeletion appelé
    expect(useTrajectoryDeletionLogic(study).performBackendDeletion).toHaveBeenCalledWith([10]);

    // dispatch appelé
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.AREA],
    });

    // updateTableAfterCellDetach appelé
    expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalled();

    // setData mis à jour
    expect(mockSetData).toHaveBeenCalledWith([{ hypothesis: 'H1' }]);

    // setReadOnly mis à jour
    expect(mockSetReadOnly).toHaveBeenCalled();
    expect(mockSetSecondTableReadOnly).toHaveBeenCalledWith({
      '0': true, '1': true, '2.0': true, '2.1': true,
    });
  });

  it('détache correctement une trajectoire dont le type est LINK', async () => {
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: {
          id: 10,
          area: 'LINK_X',
          trajectoryName: 'Traj X',
          type: TRAJECTORY_TYPE.LINK,
        },
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockResolvedValue(undefined),
    });
    const mockUpdateSTudy = vi.mocked(studyService.updateStudy);
    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

    await act(async () => {
      await result.current.detachTrajectory({
        type: TRAJECTORY_TYPE.LINK,
        indexArray: [0],
        setData: mockSetData,
        data: sampleData,
        status: 'empty',
        hypothesis: 'H1',
        setReadOnly: mockSetReadOnly,
        shouldUpdateHvdc: true,
      });
    });

    // computeDeletion appelé
    expect(useTrajectoryDeletionLogic(study).computeDeletion).toHaveBeenCalledWith(
      TRAJECTORY_TYPE.LINK,
      sampleData,
      null,
      [0],
      'H1',
      'empty',
      undefined,
    );

    // performBackendDeletion appelé
    expect(useTrajectoryDeletionLogic(study).performBackendDeletion).toHaveBeenCalledWith([10]);

    expect(mockUpdateSTudy).toHaveBeenCalledWith({ hvdc: false }, 1);

    // updateTableAfterCellDetach appelé
    expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalled();

    // setData mis à jour
    expect(mockSetData).toHaveBeenCalledWith([{ hypothesis: 'H1' }]);

    // setReadOnly mis à jour
    expect(mockSetReadOnly).toHaveBeenCalled();
  });

  // --------------------------------------------------------------------
  //  TEST 2 : Erreur avec trajectoryToDelete → handleTrajectoryError
  // --------------------------------------------------------------------
  it('appelle handleTrajectoryError en cas d’erreur avec trajectoryToDelete', async () => {
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
        },
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockRejectedValue(new Error('Boom')),
    });

    const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

    await act(async () => {
      await result.current.detachTrajectory({
        type: TRAJECTORY_TYPE.DSR,
        indexArray: [0],
        setData: mockSetData,
        data: sampleData,
        status: 'empty',
        hypothesis: 'H1',
        setReadOnly: mockSetReadOnly,
      });
    });

    expect(hypothesisTableService.handleTrajectoryError).toHaveBeenCalled();
  });

  // --------------------------------------------------------------------
  //  TEST 3 : Erreur avec trajectoryToDelete → Confirmed required => open modal
  // --------------------------------------------------------------------
  it('ouvre la modal en cas d’erreur avec Confirmed required', async () => {
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
        },
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockRejectedValue(new Error('Confirmation required')),
    });

    const { result } = renderHook(() =>
      useTrajectoryDetach(study, mockDispatch, mockSetIsDeletionModalOpen, mockSetRowIdSelected),
    );

    await act(async () => {
      await result.current.detachTrajectory({
        type: TRAJECTORY_TYPE.AREA,
        indexArray: [0],
        setData: mockSetData,
        data: sampleData,
        status: 'empty',
        hypothesis: 'H1',
        setReadOnly: mockSetReadOnly,
      });
    });

    expect(mockSetIsDeletionModalOpen).toHaveBeenCalledWith(true);
    expect(mockSetRowIdSelected).toHaveBeenCalledWith('0');
  });

  // --------------------------------------------------------------------
  //  TEST 4 : area control failed and a trajectory Links is linked to the study with ok status
  // --------------------------------------------------------------------
  it("le contrôle de l'area échoue et une trajectoire Links est liée", async () => {
    vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
      computeDeletion: vi.fn().mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: {
          id: 10,
          area: 'AREA_X',
          trajectoryName: 'Traj X',
        },
        additionalTrajectory: null,
      }),
      performBackendDeletion: vi.fn().mockRejectedValueOnce(new Error('Boom')),
    });
    const data = [
      { hypothesis: 'H1', trajectory: { id: 10, type: TRAJECTORY_TYPE.AREA, hasTimeSeries: false }, status: 'OK' },
      { hypothesis: 'H2', trajectory: { id: 11, type: TRAJECTORY_TYPE.LINK, hasTimeSeries: false }, status: 'OK' },
    ] as HypothesisRowData[];

    const { result } = renderHook(() =>
      useTrajectoryDetach(study, mockDispatch, mockSetIsDeletionModalOpen, mockSetRowIdSelected),
    );

    await act(async () => {
      await result.current.detachTrajectory({
        type: TRAJECTORY_TYPE.AREA,
        indexArray: [0],
        setData: mockSetData,
        data,
        status: 'empty',
        hypothesis: 'H1',
        setReadOnly: mockSetReadOnly,
      });
    });

    expect(useTrajectoryDeletionLogic(study).performBackendDeletion).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: STUDY_ACTION.CLEAR_TRAJECTORY_BY_TYPE,
      payload: [TRAJECTORY_TYPE.LINK],
    });
    expect(mockSetData).toHaveBeenCalled();
    const setDataCallback = mockSetData.mock.calls[0][0] as (prev: HypothesisRowData[]) => HypothesisRowData[];
    const resultData = setDataCallback([
      {
        hypothesis: 'H1',
        trajectory: { id: 10, type: TRAJECTORY_TYPE.AREA, hasTimeSeries: false } as DbTrajectory,
        status: TRAJECTORY_SELECTION_STATUS.ERROR,
      },
      { hypothesis: 'H2', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
    ]);
    expect(Object.keys(resultData[0].trajectory as DbTrajectory)).toEqual([
      'id',
      'trajectoryName',
      'technology',
      'type',
      'version',
      'userName',
      'creationDate',
      'area',
      'state',
      'hasTimeSeries',
    ]);
    expect(resultData[0].status).toBe(TRAJECTORY_SELECTION_STATUS.ERROR);
    expect(mockSetReadOnly).toHaveBeenCalledWith({ '0': false, '1': false });
  });

  describe('LINK et FLOWBASED', () => {
    const reloadedStudy: StudyDTO = { ...study, hvdc: false, recalculate: false };
    const linkTrajectory: DbTrajectory = {
      id: 10,
      trajectoryName: 'Links',
      type: TRAJECTORY_TYPE.LINK,
      version: 1,
      userName: 'user',
      creationDate: new Date('2026-01-01'),
      area: '',
      technology: '',
      hasTimeSeries: false,
    };
    const flowbasedTrajectory: DbTrajectory = {
      ...linkTrajectory,
      id: 20,
      trajectoryName: 'Flowbased',
      type: TRAJECTORY_TYPE.FLOWBASED,
    };
    const secondData: HypothesisRowData[] = [
      { hypothesis: 'HVDC', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: 'Flowbased', trajectory: flowbasedTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
      { hypothesis: 'Settings', trajectory: { ...linkTrajectory, type: TRAJECTORY_TYPE.SETTINGS }, status: TRAJECTORY_SELECTION_STATUS.OK },
    ];
    const detachArgs = {
      type: TRAJECTORY_TYPE.LINK,
      indexArray: [1],
      setData: mockSetData,
      data: sampleData,
      status: 'empty' as const,
      hypothesis: 'H2',
      setReadOnly: mockSetReadOnly,
      setSecondTableReadOnly: mockSetSecondTableReadOnly,
      secondData,
      setSecondData: mockSetSecondData,
    };
    const mockComputeDeletion = vi.fn<ReturnType<typeof useTrajectoryDeletionLogic>['computeDeletion']>();
    const mockPerformBackendDeletion = vi.fn<ReturnType<typeof useTrajectoryDeletionLogic>['performBackendDeletion']>();

    beforeEach(() => {
      vi.mocked(studyService.getStudyById).mockResolvedValue(reloadedStudy);
      mockComputeDeletion.mockReturnValue({
        trajectoryIds: [linkTrajectory.id, flowbasedTrajectory.id],
        trajectoryToDelete: linkTrajectory,
        additionalTrajectory: flowbasedTrajectory,
      });
      mockPerformBackendDeletion.mockResolvedValue(undefined);
      vi.mocked(useTrajectoryDeletionLogic).mockReturnValue({
        computeDeletion: mockComputeDeletion,
        performBackendDeletion: mockPerformBackendDeletion,
      });
    });

    it.each([true, false, undefined])('met à jour HVDC pour LINK uniquement si shouldUpdateHvdc=%s est vrai', async (shouldUpdateHvdc) => {
      vi.mocked(studyService.updateStudy).mockResolvedValueOnce({ ...study, hvdc: false });
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({ ...detachArgs, shouldUpdateHvdc });
      });

      expect(mockComputeDeletion).toHaveBeenCalledWith(
        TRAJECTORY_TYPE.LINK, sampleData, null, [1], 'H2', 'empty', secondData,
      );
      expect(mockPerformBackendDeletion).toHaveBeenCalledWith([10, 20]);
      if (shouldUpdateHvdc) {
        expect(studyService.updateStudy).toHaveBeenCalledTimes(1);
        expect(studyService.updateStudy).toHaveBeenCalledWith({ hvdc: false }, study.id);
      } else {
        expect(studyService.updateStudy).not.toHaveBeenCalled();
      }
      expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalledWith({
        type: TRAJECTORY_TYPE.LINK,
        data: sampleData,
        additionalTrajectory: flowbasedTrajectory,
        indexArray: [1],
        studyId: study.id,
        horizon: study.horizon,
        options: {
          hvdcValue: shouldUpdateHvdc ? false : undefined,
          recalculateValue: shouldUpdateHvdc ? study.recalculate : undefined,
        },
      });
    });

    it.each([true])('désactive recalculate pour FLOWBASED avec shouldUpdateHvdc=%s', async (shouldUpdateHvdc) => {
      const updatedStudy = { ...study, recalculate: false, hvdc: shouldUpdateHvdc ? false : study.hvdc };
      vi.mocked(studyService.updateStudy).mockResolvedValueOnce(updatedStudy);
      mockComputeDeletion.mockReturnValue({
        trajectoryIds: [20],
        trajectoryToDelete: flowbasedTrajectory,
        additionalTrajectory: null,
      });
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({ ...detachArgs, type: TRAJECTORY_TYPE.FLOWBASED, shouldUpdateHvdc });
      });

      expect(mockPerformBackendDeletion).toHaveBeenCalledWith([20]);
      expect(studyService.updateStudy).toHaveBeenCalledTimes(1);
      expect(studyService.updateStudy).toHaveBeenCalledWith(
        shouldUpdateHvdc ? { recalculate: false, hvdc: false } : { recalculate: false },
        study.id,
      );
      expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalledWith(
        expect.objectContaining({ options: { hvdcValue: updatedStudy.hvdc, recalculateValue: false } }),
      );
      expect(mockSetSecondData).not.toHaveBeenCalled();
      expect(mockSetSecondTableReadOnly).toHaveBeenCalled();
    });

    it.each([false, undefined])('désactive recalculate pour FLOWBASED avec shouldUpdateHvdc=%s', async (shouldUpdateHvdc) => {
      const updatedStudy = { ...study, recalculate: false, hvdc: shouldUpdateHvdc ? false : study.hvdc };
      vi.mocked(studyService.updateStudy).mockResolvedValueOnce(updatedStudy);
      mockComputeDeletion.mockReturnValue({
        trajectoryIds: [20],
        trajectoryToDelete: flowbasedTrajectory,
        additionalTrajectory: null,
      });
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({ ...detachArgs, type: TRAJECTORY_TYPE.FLOWBASED, shouldUpdateHvdc });
      });

      expect(mockPerformBackendDeletion).toHaveBeenCalledWith([20]);
      expect(studyService.updateStudy).toHaveBeenCalledTimes(1);
      expect(studyService.updateStudy).toHaveBeenCalledWith(
        shouldUpdateHvdc ? { recalculate: false, hvdc: false } : { recalculate: false },
        study.id,
      );
      expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalledWith(
        expect.objectContaining({ options: { hvdcValue: updatedStudy.hvdc, recalculateValue: false } }),
      );
      expect(mockSetSecondData).not.toHaveBeenCalled();
      expect(mockSetSecondTableReadOnly).not.toHaveBeenCalled();
    });

    it('met à jour la lecture seule du second tableau après détachement FLOWBASED lorsque HVDC est désactivé', async () => {
      const studyWithoutHvdc = { ...study, hvdc: false };
      vi.mocked(studyService.updateStudy).mockResolvedValueOnce({ ...studyWithoutHvdc, recalculate: false });
      mockComputeDeletion.mockReturnValue({
        trajectoryIds: [flowbasedTrajectory.id],
        trajectoryToDelete: flowbasedTrajectory,
        additionalTrajectory: null,
      });
      const { result } = renderHook(() => useTrajectoryDetach(studyWithoutHvdc, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({ ...detachArgs, type: TRAJECTORY_TYPE.FLOWBASED });
      });

      expect(mockSetSecondTableReadOnly).toHaveBeenCalledTimes(1);
      expect(mockSetSecondTableReadOnly).toHaveBeenCalledWith({
        '0': false, '1': true, '2.0': false, '2.1': false,
      });
      expect(mockSetSecondData).not.toHaveBeenCalled();
    });

    it('vide uniquement la trajectoire FLOWBASED du second tableau sans modifier les données initiales', async () => {
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory(detachArgs);
      });

      expect(mockSetSecondData).toHaveBeenCalledTimes(1);
      const updateSecondData = mockSetSecondData.mock.calls[0][0];
      expect(updateSecondData).toBeTypeOf('function');
      if (typeof updateSecondData !== 'function') throw new Error('Expected a state updater');
      const updatedData = updateSecondData(secondData);

      expect(updatedData).toEqual([
        secondData[0],
        { ...secondData[1], trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
        secondData[2],
      ]);
      expect(updatedData[0]).toBe(secondData[0]);
      expect(updatedData[2]).toBe(secondData[2]);
      expect(secondData[1].trajectory).toBe(flowbasedTrajectory);
      expect(secondData[1].status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
      expect(mockSetSecondTableReadOnly).toHaveBeenCalledWith({
        '0': false, '1': true, '2.0': false, '2.1': false,
      });
      const updateReadOnly = mockSetReadOnly.mock.calls[0][0];
      if (typeof updateReadOnly !== 'function') throw new Error('Expected a read-only state updater');
      expect(updateReadOnly({ '0': false, '1': false, '2': true })).toEqual({
        '0': false, '1': true, '2': true,
      });
    });

    it('ne modifie pas les données du second tableau sans trajectoire additionnelle', async () => {
      mockComputeDeletion.mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: linkTrajectory,
        additionalTrajectory: null,
      });
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory(detachArgs);
      });

      expect(mockSetSecondData).not.toHaveBeenCalled();
      expect(mockSetSecondTableReadOnly).toHaveBeenCalledWith({
        '0': false, '1': true, '2.0': false, '2.1': false,
      });
    });

    it('accepte les callbacks optionnels du second tableau absents', async () => {
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({
          ...detachArgs,
          setSecondData: undefined,
          setSecondTableReadOnly: undefined,
        });
      });

      expect(mockSetData).toHaveBeenCalledTimes(1);
      expect(hypothesisTableService.handleTrajectoryError).not.toHaveBeenCalled();
    });

    it.each([TRAJECTORY_TYPE.LINK, TRAJECTORY_TYPE.FLOWBASED])('recharge l’étude sans suppression ni mise à jour backend pour %s en statut emptyError', async (type) => {
      mockComputeDeletion.mockReturnValue({
        trajectoryIds: [10],
        trajectoryToDelete: type === TRAJECTORY_TYPE.LINK ? linkTrajectory : flowbasedTrajectory,
        additionalTrajectory: null,
      });
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({ ...detachArgs, type, status: 'emptyError', shouldUpdateHvdc: true });
      });

      expect(mockPerformBackendDeletion).not.toHaveBeenCalled();
      expect(studyService.updateStudy).not.toHaveBeenCalled();
      expect(studyService.getStudyById).toHaveBeenCalledTimes(1);
      expect(studyService.getStudyById).toHaveBeenCalledWith(study.id);
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalledWith(
        expect.objectContaining({
          options: { hvdcValue: reloadedStudy.hvdc, recalculateValue: reloadedStudy.recalculate },
        }),
      );
      expect(mockSetData).toHaveBeenCalledTimes(1);
    });

    it('recharge l’étude sans suppression ni mise à jour backend sans identifiant de trajectoire', async () => {
      mockComputeDeletion.mockReturnValue({
        trajectoryIds: [],
        trajectoryToDelete: linkTrajectory,
        additionalTrajectory: null,
      });
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({ ...detachArgs, shouldUpdateHvdc: true });
      });

      expect(mockPerformBackendDeletion).not.toHaveBeenCalled();
      expect(studyService.updateStudy).not.toHaveBeenCalled();
      expect(studyService.getStudyById).toHaveBeenCalledTimes(1);
      expect(studyService.getStudyById).toHaveBeenCalledWith(study.id);
      expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalledWith(
        expect.objectContaining({
          options: { hvdcValue: reloadedStudy.hvdc, recalculateValue: reloadedStudy.recalculate },
        }),
      );
      expect(mockSetData).toHaveBeenCalledTimes(1);
    });

    it('recharge l’étude sans suppression ni mise à jour backend sans trajectoire à détacher', async () => {
      mockComputeDeletion.mockReturnValue({
        trajectoryIds: [],
        trajectoryToDelete: null,
        additionalTrajectory: null,
      });
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({ ...detachArgs, shouldUpdateHvdc: true });
      });

      expect(mockPerformBackendDeletion).not.toHaveBeenCalled();
      expect(studyService.updateStudy).not.toHaveBeenCalled();
      expect(studyService.getStudyById).toHaveBeenCalledTimes(1);
      expect(studyService.getStudyById).toHaveBeenCalledWith(study.id);
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(hypothesisTableHelper.updateTableAfterCellDetach).toHaveBeenCalledWith(
        expect.objectContaining({
          options: { hvdcValue: reloadedStudy.hvdc, recalculateValue: reloadedStudy.recalculate },
        }),
      );
      expect(mockSetData).toHaveBeenCalledTimes(1);
    });

    it('signale un échec de mise à jour HVDC sans modifier les tableaux ni le store', async () => {
      vi.mocked(studyService.updateStudy).mockRejectedValueOnce(new Error('HVDC update failed'));
      const { result } = renderHook(() => useTrajectoryDetach(study, mockDispatch));

      await act(async () => {
        await result.current.detachTrajectory({ ...detachArgs, shouldUpdateHvdc: true });
      });

      expect(hypothesisTableService.handleTrajectoryError).toHaveBeenCalledWith(
        TRAJECTORY_TYPE.LINK,
        [1],
        { id: 10, label: 'Links' },
        '',
        'user-123',
        mockSetData,
        { message: 'studyDetails.@notificationAlert', content: 'HVDC update failed' },
        '',
      );
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(hypothesisTableHelper.updateTableAfterCellDetach).not.toHaveBeenCalled();
      expect(mockSetData).not.toHaveBeenCalled();
      expect(mockSetSecondData).not.toHaveBeenCalled();
      expect(mockSetSecondTableReadOnly).not.toHaveBeenCalled();
    });
  });
});
