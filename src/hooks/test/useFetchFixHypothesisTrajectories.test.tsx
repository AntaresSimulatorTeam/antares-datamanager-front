import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as studyService from '@/shared/services/studyService';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils';
import { useStudyDispatch } from '@/store/contexts/StudyContext';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory';
import { STUDY_ACTION } from '@/shared/enum/study';
import { DbTrajectory, StudyDTO } from '@/shared/types';
import { useFetchFixHypothesisTrajectories } from '@/hooks/useFetchFixHypothesisTrajectories.ts';
import { HypothesisConfig, HypothesisTableOptions } from '@/shared/types/HypothesisTable.ts';

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
const mockGetStudy = vi.mocked(studyService.getStudyById);
const mockUseStudyDispatch = vi.mocked(useStudyDispatch);

describe('useFetchFixHypothesisTrajectories', () => {
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
    const configs = [
      [
        { type: TRAJECTORY_TYPE.AREA, labelKey: 'areas' },
        { type: TRAJECTORY_TYPE.LINK, labelKey: 'links' },
      ],
    ];
    const options = { withReadOnlyRow: true };
    it('devrait initialiser avec des tableaux vides', async () => {
      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false,undefined));

      await waitFor(() => {
        expect(mockGetStudyTrajectories).not.toHaveBeenCalled();
        expect(result.current.firstTableData).toEqual([]);
        expect(result.current.firstTableReadOnlyRow).toEqual({});
      });
    });
  });

  describe('Récupération des trajectoires', () => {
    const configs = [
      [
        { type: TRAJECTORY_TYPE.AREA, labelKey: 'areas' },
        { type: TRAJECTORY_TYPE.LINK, labelKey: 'links' },
      ],
      [
        { type: TRAJECTORY_TYPE.ADEQUACY_PATCH, labelKey: 'adequacyPatch' },
        { type: TRAJECTORY_TYPE.FLOWBASED, labelKey: 'flowBased' },
      ],
    ];
    const options = { withReadOnlyRow: true, isStudyGenerated: false };

    it('devrait récupérer les trajectoires area et link avec succès', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([mockLinkTrajectory]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false, 1));

      await waitFor(() => {
        expect(mockGetStudyTrajectories).toHaveBeenCalledWith(1, TRAJECTORY_TYPE.AREA);
        expect(mockGetStudyTrajectories).toHaveBeenCalledWith(1, TRAJECTORY_TYPE.LINK);
      });

      await waitFor(() => {
        expect(result.current.firstTableData).toHaveLength(2);
        expect(result.current.firstTableData[0]).toEqual({
          hypothesis: 'areas',
          trajectory: mockAreaTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false
        });
        expect(result.current.firstTableData[1]).toEqual({
          hypothesis: 'links',
          trajectory: mockLinkTrajectory,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          isDefault: false,
          isDeletable: false
        });
      });
    });

    it('devrait définir le statut MISSING quand les trajectoires sont vides', async () => {
      mockGetStudyTrajectories.mockResolvedValue([]);

      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false,1));

      await waitFor(() => {
        expect(result.current.firstTableData[0].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
        expect(result.current.firstTableData[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
      });
    });

    it('devrait dispatcher les trajectoires au store', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([mockLinkTrajectory]);
        return Promise.resolve([]);
      });

      renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false, 1));

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
    const configs = [
      [
        { type: TRAJECTORY_TYPE.AREA, labelKey: 'areas' },
        { type: TRAJECTORY_TYPE.LINK, labelKey: 'links' },
      ],
      [
        { type: TRAJECTORY_TYPE.ADEQUACY_PATCH, labelKey: 'adequacyPatch' },
        { type: TRAJECTORY_TYPE.FLOWBASED, labelKey: 'flowBased' },
      ],
    ];
    const options = { withReadOnlyRow: true, isStudyGenerated: false };

    it('devrait définir readOnlyRow correctement quand toutes les trajectoires existent', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([mockLinkTrajectory]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false, 1));

      await waitFor(() => {
        expect(result.current.firstTableReadOnlyRow).toEqual({
          '0': false,
          '1': false,
        });
      });
    });

    it('devrait définir la ligne 1 comme readOnly quand link est vide et isStudyGenerated est true', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() =>
        useFetchFixHypothesisTrajectories(configs, { withReadOnlyRow: true }, true, 1),
      );

      await waitFor(() => {
        expect(result.current.firstTableReadOnlyRow).toEqual({
          '0': true,
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

      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false,1));

      await waitFor(() => {
        expect(result.current.firstTableReadOnlyRow).toEqual({
          '0': false,
          '1': false,
        });
      });
    });

    it('should call buildDispatchPayload when options.isStudyGenerated = true and withReadOnlyRow = false', async () => {
      const configsOk = [
        [
          { type: TRAJECTORY_TYPE.AREA, labelKey: 'label.a' },
          { type: TRAJECTORY_TYPE.LINK, labelKey: 'label.b' },
        ],
        [
          { type: TRAJECTORY_TYPE.ADEQUACY_PATCH, labelKey: 'label.ad' },
          { type: TRAJECTORY_TYPE.FLOWBASED, labelKey: 'label.flow' },
        ],
      ] as unknown as HypothesisConfig[][];
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        if (type === TRAJECTORY_TYPE.LINK) return Promise.resolve([]);
        return Promise.resolve([]);
      });
      const spy = vi.spyOn(trajectoryUtils, 'buildDispatchPayload');
      const optionsOk = { withReadOnlyRow: false } as unknown as HypothesisTableOptions;
      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configsOk, optionsOk, true,123));
      await waitFor(() => {
        expect(spy).toHaveBeenNthCalledWith(1, configsOk[0], [[mockAreaTrajectory], []]);
        expect(spy).toHaveBeenNthCalledWith(2, configsOk[1], [[], []]);
        expect(result.current).toHaveProperty('firstTableData');
        expect(result.current).toHaveProperty('firstTableReadOnlyRow');
        expect(result.current.firstTableReadOnlyRow).toEqual({ '0': true, '1': true });
      });
    });
  });

  describe('Gestion des erreurs', () => {
    const configs = [
      [
        { type: TRAJECTORY_TYPE.AREA, labelKey: 'areas' },
        { type: TRAJECTORY_TYPE.LINK, labelKey: 'links' },
      ],
    ];
    const options = { withReadOnlyRow: true };
    it('devrait gérer silencieusement les erreurs', async () => {
      mockGetStudyTrajectories.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false,1));

      await waitFor(() => {
        expect(result.current.firstTableData).toEqual([]);
        expect(result.current.firstTableReadOnlyRow).toEqual({});
      });

      // Vérifier qu'aucune erreur n'est levée
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('ne devrait pas dispatcher si une erreur survient', async () => {
      mockGetStudyTrajectories.mockRejectedValue(new Error('Network error'));

      renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false,1));

      await waitFor(() => {
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Réactivité', () => {
    const configs = [
      [
        { type: TRAJECTORY_TYPE.AREA, labelKey: 'areas' },
        { type: TRAJECTORY_TYPE.LINK, labelKey: 'links' },
      ],
    ];
    const mockOptions = { withReadOnlyRow: true, isStudyGenerated: false };
    it('devrait récupérer à nouveau les trajectoires quand studyId change', async () => {
      mockGetStudyTrajectories.mockResolvedValue([mockAreaTrajectory]);

      const { rerender } = renderHook(
        ({ studyId }) => useFetchFixHypothesisTrajectories(configs, mockOptions, false, studyId),
        {
          initialProps: { studyId: 1 },
        },
      );

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
  });

  describe('Cas limites', () => {
    const configs = [
      [
        { type: TRAJECTORY_TYPE.AREA, labelKey: 'areas' },
        { type: TRAJECTORY_TYPE.LINK, labelKey: 'links' },
      ],
      [
        { type: TRAJECTORY_TYPE.ADEQUACY_PATCH, labelKey: 'areas' },
        { type: TRAJECTORY_TYPE.FLOWBASED, labelKey: 'links' },
      ],
    ];
    const options = { withReadOnlyRow: true, isStudyGenerated: false };
    it('devrait gérer le cas où une seule trajectoire area existe', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        return Promise.resolve([]);
      });

      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false,1));

      await waitFor(() => {
        expect(result.current.firstTableData[0].status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
        expect(result.current.firstTableData[1].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
      });
    });

    it('devrait gérer le cas où dispatch est null', async () => {
      mockUseStudyDispatch.mockReturnValue(null);
      mockGetStudyTrajectories.mockResolvedValue([mockAreaTrajectory]);

      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false,1));

      await waitFor(() => {
        expect(result.current.firstTableData).toHaveLength(2);
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

      const { result } = renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false, 1));

      await waitFor(() => {
        expect(result.current.firstTableData[0].trajectory).toEqual(mockAreaTrajectory);
      });
    });
  });

  describe('Payload dispatch conditionnel', () => {
    const configs = [
      [
        { type: TRAJECTORY_TYPE.AREA, labelKey: 'areas' },
        { type: TRAJECTORY_TYPE.LINK, labelKey: 'links' },
      ],
      [
        { type: TRAJECTORY_TYPE.ADEQUACY_PATCH, labelKey: 'adequacyPatch' },
        { type: TRAJECTORY_TYPE.FLOWBASED, labelKey: 'flowbased' },
      ],
    ];
    const options = { withReadOnlyRow: true };
    it('ne devrait inclure que les trajectoires area dans le payload si link est vide', async () => {
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        return Promise.resolve([]);
      });

      renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false, 1));

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

      renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false,1));

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

      renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false, 1));

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
          type: STUDY_ACTION.ADD_TRAJECTORIES,
          payload: {},
        });
      });
    });
  });

  describe('Hdvc option is set to true for Link trajectory type', () => {
    const configs = [[
      { type: TRAJECTORY_TYPE.AREA, labelKey: 'areas' },
      { type: TRAJECTORY_TYPE.LINK, labelKey: 'links', hasHvdcOption: true },
    ]];
    const options = { withReadOnlyRow: true };
    it('should call getStudyById service', async () => {
      mockGetStudy.mockResolvedValue({hvdc: true} as StudyDTO);
      mockGetStudyTrajectories.mockImplementation(async (_id: number, type: TRAJECTORY_TYPE) => {
        if (type === TRAJECTORY_TYPE.AREA) return Promise.resolve([mockAreaTrajectory]);
        return Promise.resolve([]);
      });

      renderHook(() => useFetchFixHypothesisTrajectories(configs, options, false, 1));

      await waitFor(() => {
        expect(mockGetStudy).toHaveBeenCalledWith(1);
      });
    });
  });
});
