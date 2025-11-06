import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetchAreaLinkHypothesisTrajectories } from '../useFetchAreaLinkHypothesisTrajectories';
import * as studyService from '@/shared/services/studyService';
import { useStudyDispatch } from '@/store/contexts/StudyContext';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { STUDY_ACTION } from '@/shared/enum/study';
import { DbTrajectory } from '@/shared/types';

// Mocks
vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/studyService');
vi.mock('@/store/contexts/StudyContext');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'studyDetails.@areas': 'Areas',
        'studyDetails.@links': 'Links',
      };
      return translations[key] || key;
    },
  }),
}));

const mockGetStudyTrajectories = vi.mocked(studyService.getStudyTrajectories);
const mockUseStudyDispatch = vi.mocked(useStudyDispatch);

describe('useFetchAreaLinkHypothesisTrajectories', () => {
  const mockDispatch = vi.fn();

  const mockAreaTrajectory = {
    id: 1,
    trajectoryName: 'Area Trajectory 1',
    type: TRAJECTORY_TYPE.AREA,
    userName: 'user123',
    creationDate: '2024-01-01' as unknown as Date,
  } as DbTrajectory;
  const mockLinkTrajectory = {
    id: 2,
    trajectoryName: 'Link Trajectory 1',
    type: TRAJECTORY_TYPE.LINK,
    userName: 'user456',
    creationDate: '2024-01-02' as unknown as Date,
  } as DbTrajectory;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStudyDispatch.mockReturnValue(mockDispatch);
  });

  describe('Initialisation', () => {
    it('devrait initialiser avec des tableaux vides', () => {
      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, undefined));

      expect(result.current.hypothesisTrajectories).toEqual([]);
      expect(result.current.readOnlyRow).toEqual({});
    });

    it('ne devrait pas appeler getTrajectories si studyId est undefined', async () => {
      renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, undefined));

      await waitFor(() => {
        expect(mockGetStudyTrajectories).not.toHaveBeenCalled();
      });
    });
  });

  describe('Récupération des trajectoires', () => {
    it('devrait récupérer les trajectoires area et link avec succès', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([mockLinkTrajectory]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(mockGetStudyTrajectories).toHaveBeenCalledWith(1, TRAJECTORY_TYPE.AREA);
        expect(mockGetStudyTrajectories).toHaveBeenCalledWith(1, TRAJECTORY_TYPE.LINK);
      });

      await waitFor(() => {
        expect(result.current.hypothesisTrajectories).toHaveLength(2);
        expect(result.current.hypothesisTrajectories[0]).toEqual({
          hypothesis: 'Areas',
          trajectory: mockAreaTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
        });
        expect(result.current.hypothesisTrajectories[1]).toEqual({
          hypothesis: 'Links',
          trajectory: mockLinkTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
        });
      });
    });

    it('devrait définir le statut MISSING quand les trajectoires sont vides', async () => {
      mockGetStudyTrajectories.mockResolvedValue([]);

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(result.current.hypothesisTrajectories[0].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
        expect(result.current.hypothesisTrajectories[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
      });
    });

    it('devrait dispatcher les trajectoires au store', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([mockLinkTrajectory]);
        return Promise.resolve([]);
      });

      renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {
            [TRAJECTORY_TYPE.AREA]: { trajectories: [mockAreaTrajectory] },
            [TRAJECTORY_TYPE.LINK]: { trajectories: [mockLinkTrajectory] },
          },
        });
      });
    });
  });

  describe('ReadOnly state', () => {
    it('devrait définir readOnlyRow correctement quand toutes les trajectoires existent', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([mockLinkTrajectory]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(result.current.readOnlyRow).toEqual({
          '0': false,
          '1': false,
        });
      });
    });

    it('devrait définir la ligne 1 comme readOnly quand area est vide et isStudyGenerated est true', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([]);
        return [];
      });

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(true, 1));

      await waitFor(() => {
        expect(result.current.readOnlyRow).toEqual({
          '0': false,
          '1': true,
        });
      });
    });

    it('devrait définir la ligne 1 comme readOnly quand link est vide et isStudyGenerated est true', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(true, 1));

      await waitFor(() => {
        expect(result.current.readOnlyRow).toEqual({
          '0': false,
          '1': true,
        });
      });
    });

    it('ne devrait pas définir la ligne 1 comme readOnly quand link est vide mais isStudyGenerated est false', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(result.current.readOnlyRow).toEqual({
          '0': false,
          '1': false,
        });
      });
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer silencieusement les erreurs', async () => {
      mockGetStudyTrajectories.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(result.current.hypothesisTrajectories).toEqual([]);
        expect(result.current.readOnlyRow).toEqual({});
      });

      // Vérifier qu'aucune erreur n'est levée
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('ne devrait pas dispatcher si une erreur survient', async () => {
      mockGetStudyTrajectories.mockRejectedValue(new Error('Network error'));

      renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Réactivité', () => {
    it('devrait récupérer à nouveau les trajectoires quand studyId change', async () => {
      mockGetStudyTrajectories.mockResolvedValue([mockAreaTrajectory]);

      const { rerender } = renderHook(({ studyId }) => useFetchAreaLinkHypothesisTrajectories(false, studyId), {
        initialProps: { studyId: 1 },
      });

      await waitFor(() => {
        expect(mockGetStudyTrajectories).toHaveBeenCalledTimes(2);
      });

      vi.clearAllMocks();
      rerender({ studyId: 2 });

      await waitFor(() => {
        expect(mockGetStudyTrajectories).toHaveBeenCalledWith(2, TRAJECTORY_TYPE.AREA);
        expect(mockGetStudyTrajectories).toHaveBeenCalledWith(2, TRAJECTORY_TYPE.LINK);
      });
    });

    it('devrait récupérer à nouveau les trajectoires quand isStudyGenerated change', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([]);
        return Promise.resolve([]);
      });

      const { rerender, result } = renderHook(
        ({ isGenerated }) => useFetchAreaLinkHypothesisTrajectories(isGenerated, 1),
        {
          initialProps: { isGenerated: false },
        },
      );

      await waitFor(() => {
        expect(result.current.readOnlyRow['1']).toBe(false);
      });

      vi.clearAllMocks();
      rerender({ isGenerated: true });

      await waitFor(() => {
        expect(result.current.readOnlyRow['1']).toBe(true);
      });
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer le cas où une seule trajectoire area existe', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(result.current.hypothesisTrajectories[0].status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
        expect(result.current.hypothesisTrajectories[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
      });
    });

    it('devrait gérer le cas où dispatch est null', async () => {
      mockUseStudyDispatch.mockReturnValue(null);
      mockGetStudyTrajectories.mockResolvedValue([mockAreaTrajectory]);

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(result.current.hypothesisTrajectories).toHaveLength(2);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('devrait prendre le premier élément du tableau de trajectoires', async () => {
      const multipleTrajectories: DbTrajectory[] = [
        mockAreaTrajectory,
        { ...mockAreaTrajectory, id: 3, trajectoryName: 'Area 2' },
      ];

      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve(multipleTrajectories);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(result.current.hypothesisTrajectories[0].trajectory).toEqual(mockAreaTrajectory);
      });
    });
  });

  describe('Payload dispatch conditionnel', () => {
    it('ne devrait inclure que les trajectoires area dans le payload si link est vide', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        return Promise.resolve([]);
      });

      renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {
            [TRAJECTORY_TYPE.AREA]: { trajectories: [mockAreaTrajectory] },
          },
        });
      });
    });

    it('ne devrait inclure que les trajectoires link dans le payload si area est vide', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([mockLinkTrajectory]);
        return Promise.resolve([]);
      });

      renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {
            [TRAJECTORY_TYPE.LINK]: { trajectories: [mockLinkTrajectory] },
          },
        });
      });
    });

    it('ne devrait pas inclure de payload si les deux sont vides', async () => {
      mockGetStudyTrajectories.mockResolvedValue([]);

      renderHook(() => useFetchAreaLinkHypothesisTrajectories(false, 1));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {},
        });
      });
    });
  });
});
