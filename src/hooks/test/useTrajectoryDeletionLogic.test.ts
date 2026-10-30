import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  collectTrajectoriesRecursively,
  findSpecificTrajectoryToDelete,
  getSpecificTrajectories,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { useTrajectoryDeletionLogic } from '@/hooks/useTrajectoryDeletionLogic.ts';
import { DbTrajectory, HypothesisRowData, StudyDTO } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { renderHook } from '@testing-library/react';
import { shouldDeleteCapacityModulation } from '@/shared/utils/trajectoryUtils.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';

vi.mock('@/shared/utils/trajectoryUtils.ts', () => ({
  shouldDeleteCapacityModulation: vi.fn(),
}));

vi.mock('@/shared/helpers/hypothesisTableHelper.ts', () => ({
  findSpecificTrajectoryToDelete: vi.fn(),
  getSpecificTrajectories: vi.fn(),
  collectTrajectoriesRecursively: vi.fn(),
}));

vi.mock('@/shared/services/trajectoryService.ts', () => ({
  unlinkMultipleTrajectoriesFromStudy: vi.fn(),
  unlinkTrajectoryFromStudy: vi.fn(),
}));

describe('useTrajectoryDeletionLogic - THERMAL', () => {
  const study = { id: 42 } as StudyDTO;

  const specificTrajectory = { id: 10 } as DbTrajectory;
  const modulationTrajectory = { id: 99 } as DbTrajectory;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('supprime la trajectoire spécifique seule si ce n’est pas la dernière', () => {
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    vi.mocked(findSpecificTrajectoryToDelete).mockReturnValue(specificTrajectory);
    vi.mocked(getSpecificTrajectories).mockReturnValue([specificTrajectory, { id: 11 } as DbTrajectory]);

    const data = [{ subRows: [] }, { status: 'OK', trajectory: modulationTrajectory }] as HypothesisRowData[];

    const deletionResult = computeDeletion(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      data,
      null,
      null,
      'HYP',
    );

    expect(deletionResult).toEqual({
      trajectoryIds: [10],
      trajectoryToDelete: specificTrajectory,
      additionalTrajectory: null,
    });
  });

  it('supprime la spécifique + modulation si c’est la dernière', () => {
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    vi.mocked(findSpecificTrajectoryToDelete).mockReturnValue(specificTrajectory);
    vi.mocked(getSpecificTrajectories).mockReturnValue([specificTrajectory]); // dernière

    const data = [{ subRows: [] }, { status: 'OK', trajectory: modulationTrajectory }] as HypothesisRowData[];

    const deletionResult = computeDeletion(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      data,
      null,
      null,
      'HYP',
    );

    expect(deletionResult).toEqual({
      trajectoryIds: [99, 10], // modulation + spécifique
      trajectoryToDelete: specificTrajectory,
      additionalTrajectory: modulationTrajectory,
    });
  });
});

describe('computeDeletion - LINK (computeLinkDeletion)', () => {
  const study = { id: 42 } as StudyDTO;
  const link: DbTrajectory = {
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
  const flowbased: DbTrajectory = { ...link, id: 20, type: TRAJECTORY_TYPE.FLOWBASED, trajectoryName: 'Flowbased' };
  const areaRow: HypothesisRowData = {
    hypothesis: 'Areas',
    trajectory: { ...link, id: 30, type: TRAJECTORY_TYPE.AREA },
    status: TRAJECTORY_SELECTION_STATUS.OK,
  };
  const linkRow: HypothesisRowData = {
    hypothesis: 'Links',
    trajectory: link,
    status: TRAJECTORY_SELECTION_STATUS.OK,
  };
  const hvdcRow: HypothesisRowData = {
    hypothesis: 'HVDC',
    trajectory: null,
    status: TRAJECTORY_SELECTION_STATUS.MISSING,
  };
  const flowbasedRow: HypothesisRowData = {
    hypothesis: 'Flowbased',
    trajectory: flowbased,
    status: TRAJECTORY_SELECTION_STATUS.OK,
  };
  const data = [areaRow, linkRow];
  const secondData = [hvdcRow, flowbasedRow];
  const invalidStatuses = [
    TRAJECTORY_SELECTION_STATUS.MISSING,
    TRAJECTORY_SELECTION_STATUS.ERROR,
    TRAJECTORY_SELECTION_STATUS.WARNING,
  ];

  it('retourne le lien et la trajectoire FLOWBASED dans cet ordre lorsque les deux sont OK', () => {
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));

    const deletion = result.current.computeDeletion(
      TRAJECTORY_TYPE.LINK, data, null, [1], 'Links', 'empty', secondData,
    );

    expect(deletion).toEqual({
      trajectoryIds: [link.id, flowbased.id],
      trajectoryToDelete: link,
      additionalTrajectory: flowbased,
    });
    expect(deletion.trajectoryToDelete).toBe(link);
    expect(deletion.additionalTrajectory).toBe(flowbased);
  });

  it.each([
    { label: 'absent', rows: undefined },
    { label: 'vide', rows: [] },
    { label: 'sans ligne FLOWBASED', rows: [hvdcRow] },
    { label: 'avec une trajectoire FLOWBASED nulle', rows: [hvdcRow, { ...flowbasedRow, trajectory: null }] },
    ...invalidStatuses.map((status) => ({
      label: `avec FLOWBASED en statut ${status}`,
      rows: [hvdcRow, { ...flowbasedRow, status }],
    })),
  ])('retourne uniquement le lien si le second tableau est $label', ({ rows }) => {
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));

    const deletion = result.current.computeDeletion(
      TRAJECTORY_TYPE.LINK, data, null, [1], 'Links', 'empty', rows,
    );

    expect(deletion).toEqual({
      trajectoryIds: [link.id],
      trajectoryToDelete: link,
      additionalTrajectory: null,
    });
  });

  it.each([
    { label: 'tableau vide', rows: [] },
    { label: 'ligne LINK absente', rows: [areaRow] },
    { label: 'trajectoire LINK nulle', rows: [areaRow, { ...linkRow, trajectory: null }] },
    ...invalidStatuses.map((status) => ({
      label: `LINK en statut ${status}`,
      rows: [areaRow, { ...linkRow, status }],
    })),
  ])('ne supprime aucune trajectoire, même avec FLOWBASED OK : $label', ({ rows }) => {
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));

    const deletion = result.current.computeDeletion(
      TRAJECTORY_TYPE.LINK, rows, null, [1], 'Links', 'empty', secondData,
    );

    expect(deletion).toEqual({
      trajectoryIds: [],
      trajectoryToDelete: null,
      additionalTrajectory: null,
    });
  });
});

describe('computeDeletion - DSR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('supprime uniquement la trajectoire spécifique si pas de modulation', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const specific = { id: 10 } as DbTrajectory;
    vi.mocked(findSpecificTrajectoryToDelete).mockReturnValue(specific);
    vi.mocked(shouldDeleteCapacityModulation).mockReturnValue(false);

    const data = [
      { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: { id: 99 } },
      { status: TRAJECTORY_SELECTION_STATUS.ERROR },
    ] as HypothesisRowData[];

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.DSR, data, null, [0], 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [10],
      trajectoryToDelete: specific,
      additionalTrajectory: null,
    });
  });
  it('supprime la trajectoire spécifique + modulation si applicable', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const specific = { id: 10 } as DbTrajectory;
    const modulation = { id: 99 };

    vi.mocked(findSpecificTrajectoryToDelete).mockReturnValue(specific);
    vi.mocked(shouldDeleteCapacityModulation).mockReturnValue(true);

    const data = [
      { status: TRAJECTORY_SELECTION_STATUS.ERROR },
      { status: TRAJECTORY_SELECTION_STATUS.OK, trajectory: modulation },
    ] as HypothesisRowData[];

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.DSR, data, null, [0], 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [99, 10],
      trajectoryToDelete: specific,
      additionalTrajectory: modulation,
    });
  });
});

describe('computeDeletion - AREA_ME', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('collecte toutes les trajectoires récursivement pour toutes les lignes et cible la ligne indexRow', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const row0 = {
      trajectory: { id: 101 },
      subRows: [{ trajectory: { id: 102 } }],
    } as unknown as HypothesisRowData;
    const row1 = {
      trajectory: { id: 201 },
    } as unknown as HypothesisRowData;

    const data = [row0, row1];

    vi.mocked(collectTrajectoriesRecursively)
      .mockReturnValueOnce([{ id: 101 }, { id: 102 }] as DbTrajectory[])
      .mockReturnValueOnce([{ id: 201 }] as DbTrajectory[]);

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.AREA_ME, data, 0, null, 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [101, 102, 201],
      trajectoryToDelete: { id: 101 },
      additionalTrajectory: null,
    });
  });

  it('cible une sous-ligne quand indexArray de taille 2 est fourni', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const subRow = { trajectory: { id: 102 } } as HypothesisRowData;
    const row0 = {
      trajectory: { id: 101 },
      subRows: [{ trajectory: { id: 100 } }, subRow],
    } as unknown as HypothesisRowData;

    const data = [row0];

    vi.mocked(collectTrajectoriesRecursively).mockReturnValueOnce([
      { id: 101 },
      { id: 100 },
      { id: 102 },
    ] as DbTrajectory[]);

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.AREA_ME, data, null, [0, 1], 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [101, 100, 102],
      trajectoryToDelete: { id: 102 },
      additionalTrajectory: null,
    });
  });

  it('lève une erreur si indexRow et indexArray sont tous les deux null', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const data = [{ trajectory: { id: 101 } }] as HypothesisRowData[];
    vi.mocked(collectTrajectoriesRecursively).mockReturnValue([{ id: 101 }] as DbTrajectory[]);

    expect(() => {
      computeDeletion(TRAJECTORY_TYPE.AREA_ME, data, null, null, 'HYP');
    }).toThrow('computeDeletion: indexRow and indexArray are both null. One must be provided.');
  });
});

describe('computeDeletion - générique', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('supprime toutes les trajectoires de la ligne (indexRow)', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const row = {
      trajectory: { id: 5 },
    };

    const collected = [{ id: 5 }, { id: 6 }] as DbTrajectory[];
    vi.mocked(collectTrajectoriesRecursively).mockReturnValue(collected);

    const data = [row] as HypothesisRowData[];

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.LOAD, data, 0, null, 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [5, 6],
      trajectoryToDelete: row.trajectory,
      additionalTrajectory: null,
    });
  });

  it('supprime toutes les trajectoires d’une sous-ligne (indexArray)', () => {
    const study = { id: 1 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const computeDeletion = result.current.computeDeletion;

    const subRow = {
      trajectory: { id: 20 },
    };

    const collected = [{ id: 20 }, { id: 21 }] as DbTrajectory[];
    vi.mocked(collectTrajectoriesRecursively).mockReturnValue(collected);

    const data = [
      {
        subRows: [null, subRow],
      },
    ] as HypothesisRowData[];

    const resultDeletion = computeDeletion(TRAJECTORY_TYPE.STS, data, null, [0, 1], 'HYP');

    expect(resultDeletion).toEqual({
      trajectoryIds: [20, 21],
      trajectoryToDelete: subRow.trajectory,
      additionalTrajectory: null,
    });
  });
});

describe('computeDeletion - générique', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ne fait rien si study.id est absent', async () => {
    const study = { id: null } as unknown as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const performBackendDeletion = result.current.performBackendDeletion;
    await performBackendDeletion([1]);
    expect(trajectoryService.unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
    expect(trajectoryService.unlinkMultipleTrajectoriesFromStudy).not.toHaveBeenCalled();
  });
  it('ne fait rien si trajectoryIds est vide', async () => {
    const study = { id: 42 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const performBackendDeletion = result.current.performBackendDeletion;
    await performBackendDeletion([]);
    expect(trajectoryService.unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
    expect(trajectoryService.unlinkMultipleTrajectoriesFromStudy).not.toHaveBeenCalled();
  });

  it('appelle unlinkTrajectoryFromStudy quand un seul ID', async () => {
    const study = { id: 10 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const performBackendDeletion = result.current.performBackendDeletion;

    const trajectoryIds = [1];
    await performBackendDeletion(trajectoryIds);

    expect(trajectoryService.unlinkTrajectoryFromStudy).toHaveBeenCalledWith(1, 10);
    expect(trajectoryService.unlinkMultipleTrajectoriesFromStudy).not.toHaveBeenCalled();
  });

  it('appelle unlinkMultipleTrajectoriesFromStudy quand plusieurs IDs', async () => {
    const study = { id: 10 } as StudyDTO;
    const { result } = renderHook(() => useTrajectoryDeletionLogic(study));
    const performBackendDeletion = result.current.performBackendDeletion;

    const trajectoryIds = [1, 5];
    await performBackendDeletion(trajectoryIds);

    expect(trajectoryService.unlinkMultipleTrajectoriesFromStudy).toHaveBeenCalledWith(10, trajectoryIds);
    expect(trajectoryService.unlinkTrajectoryFromStudy).not.toHaveBeenCalled();
  });
});
