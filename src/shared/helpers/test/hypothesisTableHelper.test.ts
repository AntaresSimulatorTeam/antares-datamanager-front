import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { mockDbTrajectory } from '@/mocks/data/tests/trajectory.mock.ts';
import {
  buildHypothesisRows,
  buildPayload,
  buildReadOnlyMap,
  collectTrajectoriesRecursively,
  computeDsrDataAndReadOnly,
  fetchAndNormalizeTrajectories,
  findSpecificTrajectoryToDelete,
  getCheckedValues,
  getInformationMessage,
  getReadOnlyForGeneratedStudy,
  getSpecificTrajectories,
  shouldOpenDeletionModal,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import * as studyService from '@/shared/services/studyService.ts';
import * as defaultConfigService from '@/shared/services/defaultConfigService.ts';
import * as sortUtils from '@/shared/utils/sortUtils.ts';

import { generateReadOnlyIndexMap, retrieveReadOnlyArea } from '../../utils/trajectoryUtils';
import { TFunction } from 'i18next';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/hypothesisTableService');
vi.mock('@/shared/services/defaultConfigService');
vi.mock('@/shared/services/studyService');
vi.mock('@/shared/utils/trajectoryUtils.ts');
vi.mock('@/shared/utils/sortUtils.ts');

describe('getReadOnlyForGeneratedStudy', () => {
  const mockReadOnlyResult: ReadOnlyObject = { H1: true, H3: true };

  it('should call setReadOnly with the result of retrieveReadOnlyArea for rows without trajectory', () => {
    vi.mocked(trajectoryUtils.retrieveReadOnlyArea).mockReturnValue(mockReadOnlyResult);
    const mockRows: HypothesisRowData[] = [
      { hypothesis: 'H1', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: 'H2', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
      { hypothesis: 'H3', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: 'H4', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
    ];

    const expectedHypotheses = ['H1', 'H3'];

    getReadOnlyForGeneratedStudy(mockRows);

    expect(trajectoryUtils.retrieveReadOnlyArea).toHaveBeenCalledWith(mockRows, expectedHypotheses);
  });
});

describe('shouldOpenDeletionModal', () => {
  const baseRow: HypothesisRowData = {
    hypothesis: 'Zone A',
    trajectory: { id: 1, trajectoryName: 'Traj A', area: 'Zone A' } as DbTrajectory,
    status: TRAJECTORY_SELECTION_STATUS.OK,
    subRows: [],
  };

  it('returns true when trajectory is linked to area and type is not THERMAL_CAPACITY', () => {
    const data = [baseRow];
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, 0, data);
    expect(result).toBe(true);
  });

  it('returns true when trajectory is linked to area and type is THERMAL_TECHNICAL_SPECIFIC_PARAMETER', () => {
    const data: HypothesisRowData[] = [
      {
        hypothesis: 'Specific',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        subRows: [baseRow],
      },
      {
        hypothesis: 'Param modulation',
        trajectory: { id: 1, trajectoryName: 'Traj A', area: 'Zone A' } as DbTrajectory,
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: [],
      },
    ];
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, 0, data);
    expect(result).toBe(true);
  });

  it('returns false when trajectory is linked to area but type is THERMAL_CAPACITY and no subRows', () => {
    const data = [baseRow];
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_CAPACITY, 0, data);
    expect(result).toBe(false);
  });

  it('returns true when trajectory is linked to area and subRows contain valid trajectory', () => {
    const data: HypothesisRowData[] = [
      {
        ...baseRow,
        subRows: [
          {
            hypothesis: 'Tech A',
            trajectory: { id: 2, trajectoryName: 'Traj B', area: 'Tech A' } as DbTrajectory,
            status: TRAJECTORY_SELECTION_STATUS.OK,
            subRows: [],
          },
        ],
      },
    ];
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.THERMAL_CAPACITY, 0, data);
    expect(result).toBe(true);
  });

  it('returns false when indexRow is invalid', () => {
    const data = [baseRow];
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, -1, data);
    expect(result).toBe(false);
  });

  it('returns false when no trajectory is linked', () => {
    const data: HypothesisRowData[] = [
      {
        hypothesis: 'Zone A',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        subRows: [],
      },
    ];
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, 0, data);
    expect(result).toBe(false);
  });

  it('returns false when indexRow is out of bounds', () => {
    const data = [baseRow];
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, 5, data);
    expect(result).toBe(false);
  });

  it('returns false when data is empty', () => {
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, 0, []);
    expect(result).toBe(false);
  });

  it('returns false when data[indexRow] is undefined', () => {
    const data: HypothesisRowData[] = [];
    data[3] = baseRow;
    const result = shouldOpenDeletionModal(TRAJECTORY_TYPE.LOAD, 1, data);
    expect(result).toBe(false);
  });
});

describe('getCheckedValues', () => {
  it('retourne les hypothèses présentes dans areas', () => {
    const data = [{ hypothesis: 'A' }, { hypothesis: 'B' }, { hypothesis: 'C' }] as HypothesisRowData[];
    const areas = [{ areaName: 'A' }, { areaName: 'C' }] as TrajectoryAreaData[];
    const defaultAreas: { name: string }[] = [];

    const result = getCheckedValues(data, areas, defaultAreas);

    expect(result).toEqual(['A', 'C']);
  });

  it('retourne les hypothèses présentes dans defaultAreas', () => {
    const data = [{ hypothesis: 'X' }, { hypothesis: 'Y' }] as HypothesisRowData[];
    const areas = [] as TrajectoryAreaData[];
    const defaultAreas = [{ name: 'Y' }];

    const result = getCheckedValues(data, areas, defaultAreas);

    expect(result).toEqual(['Y']);
  });

  it('retourne un tableau vide si aucune correspondance', () => {
    const data = [{ hypothesis: 'A' }, { hypothesis: 'B' }] as HypothesisRowData[];
    const areas = [{ areaName: 'Z' }] as TrajectoryAreaData[];
    const defaultAreas = [{ name: 'W' }];

    const result = getCheckedValues(data, areas, defaultAreas);

    expect(result).toEqual([]);
  });

  it('gère le cas où data est vide', () => {
    const data = [] as HypothesisRowData[];
    const areas = [{ areaName: 'A' }] as TrajectoryAreaData[];
    const defaultAreas = [{ name: 'B' }];

    const result = getCheckedValues(data, areas, defaultAreas);

    expect(result).toEqual([]);
  });

  it('gère le cas où areas et defaultAreas sont vides', () => {
    const data = [{ hypothesis: 'A' }, { hypothesis: 'B' }] as HypothesisRowData[];
    const areas = [] as TrajectoryAreaData[];
    const defaultAreas: { name: string }[] = [];

    const result = getCheckedValues(data, areas, defaultAreas);

    expect(result).toEqual([]);
  });
});

const makeTrajectory = (id: number): DbTrajectory =>
  ({
    id,
    area: `area-${id}`,
  }) as DbTrajectory;

describe('collectTrajectoriesRecursively', () => {
  it('retourne la trajectoire de la ligne si status OK', () => {
    const row: HypothesisRowData = {
      hypothesis: 'H1',
      trajectory: makeTrajectory(1),
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: null,
    };

    const result = collectTrajectoriesRecursively(row);
    expect(result).toEqual([makeTrajectory(1)]);
  });

  it('ignore la trajectoire si status != OK', () => {
    const row: HypothesisRowData = {
      hypothesis: 'H1',
      trajectory: makeTrajectory(1),
      status: TRAJECTORY_SELECTION_STATUS.MISSING,
      subRows: null,
    };

    const result = collectTrajectoriesRecursively(row);
    expect(result).toEqual([]);
  });

  it('récupère les trajectoires dans les subRows', () => {
    const row: HypothesisRowData = {
      hypothesis: 'H1',
      trajectory: makeTrajectory(1),
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [
        {
          hypothesis: 'H1-1',
          trajectory: makeTrajectory(2),
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: null,
        },
      ],
    };

    const result = collectTrajectoriesRecursively(row);
    expect(result).toEqual([makeTrajectory(1), makeTrajectory(2)]);
  });

  it('récupère les trajectoires dans les subRows imbriqués (récursion)', () => {
    const row: HypothesisRowData = {
      hypothesis: 'H1',
      trajectory: makeTrajectory(1),
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [
        {
          hypothesis: 'H1-1',
          trajectory: makeTrajectory(2),
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: [
            {
              hypothesis: 'H1-1-1',
              trajectory: makeTrajectory(3),
              status: TRAJECTORY_SELECTION_STATUS.OK,
              subRows: null,
            },
          ],
        },
      ],
    };

    const result = collectTrajectoriesRecursively(row);
    expect(result).toEqual([makeTrajectory(1), makeTrajectory(2), makeTrajectory(3)]);
  });

  it('ignore les subRows sans trajectoire ou status != OK', () => {
    const row: HypothesisRowData = {
      hypothesis: 'H1',
      trajectory: makeTrajectory(1),
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: [
        {
          hypothesis: 'H1-1',
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.OK,
          subRows: null,
        },
        {
          hypothesis: 'H1-2',
          trajectory: makeTrajectory(2),
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
          subRows: null,
        },
      ],
    };

    const result = collectTrajectoriesRecursively(row);
    expect(result).toEqual([makeTrajectory(1)]);
  });

  it('retourne un tableau vide si aucune trajectoire', () => {
    const row: HypothesisRowData = {
      hypothesis: 'H1',
      trajectory: null,
      status: TRAJECTORY_SELECTION_STATUS.OK,
      subRows: null,
    };

    const result = collectTrajectoriesRecursively(row);
    expect(result).toEqual([]);
  });
});

describe('getSpecificTrajectories', () => {
  it('retourne un tableau vide si subRows est undefined', () => {
    const result = getSpecificTrajectories(undefined);
    expect(result).toEqual([]);
  });

  it('retourne un tableau vide si subRows est null', () => {
    const result = getSpecificTrajectories(null);
    expect(result).toEqual([]);
  });

  it('retourne un tableau vide si subRows est vide', () => {
    const result = getSpecificTrajectories([]);
    expect(result).toEqual([]);
  });

  it('retourne uniquement les trajectoires avec status OK', () => {
    const subRows: HypothesisRowData[] = [
      {
        hypothesis: 'H1',
        trajectory: makeTrajectory(1),
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
      {
        hypothesis: 'H2',
        trajectory: makeTrajectory(2),
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        subRows: null,
      },
    ];

    const result = getSpecificTrajectories(subRows);
    expect(result).toEqual([makeTrajectory(1)]);
  });

  it('ignore les subRows sans trajectory', () => {
    const subRows: HypothesisRowData[] = [
      {
        hypothesis: 'H1',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
      {
        hypothesis: 'H2',
        trajectory: makeTrajectory(2),
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
    ];

    const result = getSpecificTrajectories(subRows);
    expect(result).toEqual([makeTrajectory(2)]);
  });

  it('retourne toutes les trajectoires valides', () => {
    const subRows: HypothesisRowData[] = [
      {
        hypothesis: 'H1',
        trajectory: makeTrajectory(1),
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
      {
        hypothesis: 'H2',
        trajectory: makeTrajectory(2),
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
    ];

    const result = getSpecificTrajectories(subRows);
    expect(result).toEqual([makeTrajectory(1), makeTrajectory(2)]);
  });
});

describe('findSpecificTrajectoryToDelete', () => {
  it('retourne null si subRows est undefined', () => {
    const result = findSpecificTrajectoryToDelete(undefined, 'H1');
    expect(result).toBeNull();
  });

  it('retourne null si subRows est null', () => {
    const result = findSpecificTrajectoryToDelete(null, 'H1');
    expect(result).toBeNull();
  });

  it('retourne null si subRows est vide', () => {
    const result = findSpecificTrajectoryToDelete([], 'H1');
    expect(result).toBeNull();
  });

  it('retourne null si aucune subRow ne correspond à la valeur', () => {
    const subRows: HypothesisRowData[] = [
      {
        hypothesis: 'H2',
        trajectory: makeTrajectory(1),
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
    ];

    const result = findSpecificTrajectoryToDelete(subRows, 'H1');
    expect(result).toBeNull();
  });

  it('retourne null si la subRow correspondante n’a pas de trajectory', () => {
    const subRows: HypothesisRowData[] = [
      {
        hypothesis: 'H1',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
    ];

    const result = findSpecificTrajectoryToDelete(subRows, 'H1');
    expect(result).toBeNull();
  });

  it('retourne null si la subRow correspondante a un status != OK', () => {
    const subRows: HypothesisRowData[] = [
      {
        hypothesis: 'H1',
        trajectory: makeTrajectory(1),
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        subRows: null,
      },
    ];

    const result = findSpecificTrajectoryToDelete(subRows, 'H1');
    expect(result).toBeNull();
  });

  it('retourne la trajectoire si la subRow correspondante est valide', () => {
    const traj = makeTrajectory(1);

    const subRows: HypothesisRowData[] = [
      {
        hypothesis: 'H1',
        trajectory: traj,
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
    ];

    const result = findSpecificTrajectoryToDelete(subRows, 'H1');
    expect(result).toEqual(traj);
  });

  it('retourne la première trajectoire valide si plusieurs subRows existent', () => {
    const traj2 = makeTrajectory(2);

    const subRows: HypothesisRowData[] = [
      {
        hypothesis: 'H1',
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
      {
        hypothesis: 'H1',
        trajectory: traj2,
        status: TRAJECTORY_SELECTION_STATUS.OK,
        subRows: null,
      },
      {
        hypothesis: 'H1',
        trajectory: makeTrajectory(3),
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
        subRows: null,
      },
    ];

    const result = findSpecificTrajectoryToDelete(subRows, 'H1');
    expect(result).toEqual(traj2);
  });
});

describe('getInformationMessage', () => {
  it('retourne null si le type est undefined', () => {
    expect(getInformationMessage(3, undefined)).toBeNull();
  });

  it('retourne le message thermal avec index = 1', () => {
    const result = getInformationMessage(5, TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER);

    expect(result).toEqual({
      messageKey: 'thermal.@paramModulationMessage',
      index: 1,
    });
  });

  it('retourne le message DSR avec index = nbRows - 1', () => {
    const result = getInformationMessage(4, TRAJECTORY_TYPE.DSR);

    expect(result).toEqual({
      messageKey: 'dsr.@capacityModulationMessage',
      index: 3,
    });
  });

  it('retourne un index minimum de 0 pour DSR si nbRows <= 1', () => {
    expect(getInformationMessage(1, TRAJECTORY_TYPE.DSR)).toEqual({
      messageKey: 'dsr.@capacityModulationMessage',
      index: 0,
    });

    expect(getInformationMessage(0, TRAJECTORY_TYPE.DSR)).toEqual({
      messageKey: 'dsr.@capacityModulationMessage',
      index: 0,
    });
  });
});

describe('computeDsrDataAndReadOnly', () => {
  const row = (hypothesis: string, status: TRAJECTORY_SELECTION_STATUS): HypothesisRowData => ({
    hypothesis,
    trajectory: null,
    status,
  });
  it('append le dernier item de prev à la fin des données', () => {
    const prev = [row('A', TRAJECTORY_SELECTION_STATUS.MISSING), row('LAST', TRAJECTORY_SELECTION_STATUS.MISSING)];
    const nextSortedWithoutLast = [
      row('B', TRAJECTORY_SELECTION_STATUS.MISSING),
      row('C', TRAJECTORY_SELECTION_STATUS.OK),
    ];

    const { data } = computeDsrDataAndReadOnly(prev, nextSortedWithoutLast);

    expect(data.map((r) => r.hypothesis)).toEqual(['B', 'C', 'LAST']);
  });

  it('ne crash pas si prev est vide (pas de lastItem)', () => {
    const prev: HypothesisRowData[] = [];
    const nextSortedWithoutLast = [row('B', TRAJECTORY_SELECTION_STATUS.MISSING)];

    const { data, computeReadOnly } = computeDsrDataAndReadOnly(prev, nextSortedWithoutLast);

    expect(data.map((r) => r.hypothesis)).toEqual(['B']);
    expect(computeReadOnly({})).toEqual({ 0: true }); // pas de OK => last index readOnly = true
  });

  it('computeReadOnly: nettoie les clés numériques existantes et ne garde que le dernier index', () => {
    const prev = [row('X', TRAJECTORY_SELECTION_STATUS.MISSING), row('LAST', TRAJECTORY_SELECTION_STATUS.MISSING)];
    const nextSortedWithoutLast = [
      row('A', TRAJECTORY_SELECTION_STATUS.MISSING),
      row('B', TRAJECTORY_SELECTION_STATUS.MISSING),
    ]; // => data length = 3, lastIndex = 2

    const { computeReadOnly } = computeDsrDataAndReadOnly(prev, nextSortedWithoutLast);

    const prevReadOnly: ReadOnlyObject = {
      0: true,
      1: true,
      foo: true, // doit être conservé (clé non numérique)
      '2.subRows.0': true, // conservé (non purement numérique)
    };

    const next = computeReadOnly(prevReadOnly);

    expect(next).toEqual({
      foo: true,
      '2.subRows.0': true,
      2: true, // pas de OK => readOnly sur le dernier index
    });
  });

  it('computeReadOnly: met le dernier index à false s’il existe une trajectoire spécifique (OK)', () => {
    const prev = [row('A', TRAJECTORY_SELECTION_STATUS.MISSING), row('LAST', TRAJECTORY_SELECTION_STATUS.MISSING)];
    const nextSortedWithoutLast = [row('B', TRAJECTORY_SELECTION_STATUS.OK)]; // OK => hasSpecificTrajectory = true

    const { data, computeReadOnly } = computeDsrDataAndReadOnly(prev, nextSortedWithoutLast);

    expect(data.map((r) => r.hypothesis)).toEqual(['B', 'LAST']);
    expect(computeReadOnly({ 0: true, 1: true })).toEqual({ 1: false }); // nettoie 0/1 et remet lastIndex=1 à false
  });

  it('si data est vide (lastIndex = -1), computeReadOnly ne rajoute rien', () => {
    const prev: HypothesisRowData[] = [];
    const nextSortedWithoutLast: HypothesisRowData[] = [];

    const { data, computeReadOnly } = computeDsrDataAndReadOnly(prev, nextSortedWithoutLast);

    expect(data).toEqual([]);
    expect(computeReadOnly({ 0: true, foo: true })).toEqual({ foo: true }); // supprime "0", ne peut pas définir lastIndex
  });
});

describe('fetchAndNormalizeTrajectories (Vitest)', () => {
  const defaultAreas = [{ name: 'A' }, { name: 'B' }];
  const emptyAreaSelected = [{ id: 99, trajectoryName: '' }] as DbTrajectory[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------
  // CASE 1 — DSR
  // ---------------------------------------------------------
  it('should fetch and normalize DSR trajectories including DSR_CM', async () => {
    vi.mocked(hypothesisTableService.fetchTrajectoriesFromTypes).mockResolvedValue({
      DSR: [{ id: 1, trajectoryName: 'Cluster1' }] as DbTrajectory[],
      DSR_CAPACITY_MODULATION: [{ id: 2, trajectoryName: 'CM1' }] as DbTrajectory[],
    });

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([
      { id: 3, trajectoryName: '' },
    ] as DbTrajectory[]);

    vi.mocked(trajectoryUtils.removeDuplicate).mockReturnValue([
      { id: 1, trajectoryName: 'Cluster1' },
      { id: 99, trajectoryName: '' },
      { id: 3, trajectoryName: '' },
    ] as DbTrajectory[]);

    const result = await fetchAndNormalizeTrajectories({
      id: 10,
      trajType: TRAJECTORY_TYPE.DSR,
      defaultAreas,
      emptyAreaSelected,
    });

    expect(hypothesisTableService.fetchTrajectoriesFromTypes).toHaveBeenCalledWith(10, [
      TRAJECTORY_TYPE.DSR,
      TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION,
    ]);

    expect(result).toEqual({
      trajectories: [
        { id: 1, trajectoryName: 'Cluster1' },
        { id: 99, trajectoryName: '' },
        { id: 3, trajectoryName: '' },
      ],
      dsrCmResult: [{ id: 2, trajectoryName: 'CM1' }],
      technologies: null,
    });
  });

  // ---------------------------------------------------------
  // CASE 2 — THERMAL_CAPACITY
  // ---------------------------------------------------------
  it('should fetch thermal trajectories and map technologies', async () => {
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([
      { id: 10, trajectoryName: 'T1', technology: 'Gas' },
    ] as DbTrajectory[]);

    vi.mocked(defaultConfigService.getThermalTechnologyList).mockResolvedValue([{ name: 'Gas' }, { name: 'Coal' }]);

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([
      { id: 11, trajectoryName: '' },
    ] as DbTrajectory[]);

    vi.mocked(trajectoryUtils.removeDuplicateByTechnology).mockReturnValue([
      { id: 10, trajectoryName: 'T1', technology: 'Gas' },
      { id: 99, trajectoryName: '' },
      { id: 11, trajectoryName: '' },
    ] as DbTrajectory[]);

    const result = await fetchAndNormalizeTrajectories({
      id: 5,
      trajType: TRAJECTORY_TYPE.THERMAL_CAPACITY,
      defaultAreas,
      emptyAreaSelected,
    });

    expect(studyService.getStudyTrajectories).toHaveBeenCalledWith(5, TRAJECTORY_TYPE.THERMAL_CAPACITY);

    expect(result).toEqual({
      trajectories: [
        { id: 10, trajectoryName: 'T1', technology: 'Gas' },
        { id: 99, trajectoryName: '' },
        { id: 11, trajectoryName: '' },
      ],
      dsrCmResult: [],
      technologies: ['Gas', 'Coal'],
    });
  });

  // ---------------------------------------------------------
  // CASE 3 — STS
  // ---------------------------------------------------------
  it('should fetch STS trajectories and use STS technologies', async () => {
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([
      { id: 20, trajectoryName: 'STS1', technology: 'Battery' },
    ] as DbTrajectory[]);

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([]);

    vi.mocked(trajectoryUtils.removeDuplicateByTechnology).mockReturnValue([
      { id: 20, trajectoryName: 'STS1', technology: 'Battery' },
    ] as DbTrajectory[]);

    const result = await fetchAndNormalizeTrajectories({
      id: 7,
      trajType: TRAJECTORY_TYPE.STS,
      defaultAreas,
      emptyAreaSelected,
    });

    expect(result.trajectories.length).toBe(1);
    expect(result.dsrCmResult).toEqual([]);
    expect(result.technologies).toBeDefined();
  });

  // ---------------------------------------------------------
  // CASE 4 — Generic type
  // ---------------------------------------------------------
  it('should fetch generic trajectories and remove duplicates', async () => {
    vi.mocked(studyService.getStudyTrajectories).mockResolvedValue([{ id: 30, trajectoryName: 'X' }] as DbTrajectory[]);

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([
      { id: 31, trajectoryName: '' },
    ] as DbTrajectory[]);

    vi.mocked(trajectoryUtils.removeDuplicate).mockReturnValue([
      { id: 30, trajectoryName: 'X' },
      { id: 99, trajectoryName: '' },
      { id: 31, trajectoryName: '' },
    ] as DbTrajectory[]);

    const result = await fetchAndNormalizeTrajectories({
      id: 3,
      trajType: TRAJECTORY_TYPE.LOAD,
      defaultAreas,
      emptyAreaSelected,
    });

    expect(result).toEqual({
      trajectories: [
        { id: 30, trajectoryName: 'X' },
        { id: 99, trajectoryName: '' },
        { id: 31, trajectoryName: '' },
      ],
      dsrCmResult: [],
      technologies: undefined,
    });
  });
});

describe('buildPayload', () => {
  it('should build a simple payload when no DSR_CM', () => {
    const result = buildPayload(TRAJECTORY_TYPE.DSR, [{ id: 1 }] as DbTrajectory[], []);

    expect(result).toEqual({
      DSR: { trajectories: [{ id: 1 }] },
    });
  });

  it('should include DSR_CM when provided', () => {
    const result = buildPayload(TRAJECTORY_TYPE.DSR, [{ id: 1 }] as DbTrajectory[], [{ id: 2 }] as DbTrajectory[]);

    expect(result).toEqual({
      DSR: { trajectories: [{ id: 1 }] },
      DSR_CAPACITY_MODULATION: { trajectories: [{ id: 2 }] },
    });
  });

  it('should not include DSR_CM when empty', () => {
    const result = buildPayload(TRAJECTORY_TYPE.DSR, [{ id: 1 }] as DbTrajectory[], []);

    expect(result).toEqual({
      DSR: { trajectories: [{ id: 1 }] },
    });
  });
});

describe('buildReadOnlyMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const rows = [{ status: 'OK' }, { status: 'MISSING' }] as HypothesisRowData[];

  const defaultAreaListNotInList = ['A', 'B'];

  it('should use generateReadOnlyIndexMap when study is generated', () => {
    vi.mocked(trajectoryUtils.generateReadOnlyIndexMap).mockReturnValue({ 0: true, 1: true });

    const result = buildReadOnlyMap({
      rows,
      trajType: TRAJECTORY_TYPE.DSR,
      isStudyGenerated: true,
      defaultAreaListNotInList,
    });

    expect(result).toEqual({ 0: true, 1: true });
    expect(generateReadOnlyIndexMap).toHaveBeenCalledWith(rows);
  });

  it('should use retrieveReadOnlyArea when study is not generated', () => {
    vi.mocked(trajectoryUtils.retrieveReadOnlyArea).mockReturnValue({ 0: false, 1: true });

    const result = buildReadOnlyMap({
      rows,
      trajType: TRAJECTORY_TYPE.THERMAL_CAPACITY,
      isStudyGenerated: false,
      defaultAreaListNotInList,
    });

    expect(result).toEqual({ 0: false, 1: true });
    expect(retrieveReadOnlyArea).toHaveBeenCalledWith(rows, defaultAreaListNotInList);
  });

  it('should add DSR-specific readonly rule', () => {
    vi.mocked(trajectoryUtils.retrieveReadOnlyArea).mockReturnValue({ 0: false });

    const result = buildReadOnlyMap({
      rows,
      trajType: TRAJECTORY_TYPE.DSR,
      isStudyGenerated: false,
      defaultAreaListNotInList,
    });

    // dernière ligne = index 1
    expect(result).toEqual({
      0: false,
      1: false, // car au moins un row.status === OK
    });
  });

  it('should lock last row when no OK trajectory in DSR', () => {
    const rowsNoOk = [{ status: 'MISSING' }, { status: 'MISSING' }] as unknown as HypothesisRowData[];

    vi.mocked(trajectoryUtils.retrieveReadOnlyArea).mockReturnValue({ 0: false });

    const result = buildReadOnlyMap({
      rows: rowsNoOk,
      trajType: TRAJECTORY_TYPE.DSR,
      isStudyGenerated: false,
      defaultAreaListNotInList,
    });

    expect(result).toEqual({
      0: false,
      1: true, // verrouillé car aucun OK
    });
  });
});

describe('buildHypothesisRows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const t = vi.fn((key: string) => key) as unknown as TFunction<'translation', undefined>;

  it('should build rows for THERMAL_CAPACITY', () => {
    vi.mocked(trajectoryUtils.convertIntoHypothesisRowWithTechnologies).mockReturnValue([
      { id: 1 },
    ] as unknown as HypothesisRowData[]);
    vi.mocked(sortUtils.sortWithFixedPosition).mockReturnValue([{ id: 1 }] as unknown as HypothesisRowData[]);

    const result = buildHypothesisRows({
      trajType: TRAJECTORY_TYPE.THERMAL_CAPACITY,
      trajectories: [{ id: 10 }] as unknown as DbTrajectory[],
      defaultAreas: [],
      areas: [],
      technologies: ['Gas'],
      isStudyGenerated: false,
      t,
      dsrCmResult: [],
    });

    expect(trajectoryUtils.convertIntoHypothesisRowWithTechnologies).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should build rows for generic type', () => {
    vi.mocked(trajectoryUtils.buildRowWithSubRowsData).mockReturnValue({ id: 1 } as unknown as HypothesisRowData);
    vi.mocked(sortUtils.sortWithFixedPosition).mockReturnValue([{ id: 1 }] as unknown as HypothesisRowData[]);

    const result = buildHypothesisRows({
      trajType: TRAJECTORY_TYPE.LOAD,
      trajectories: [{ id: 10 }] as DbTrajectory[],
      defaultAreas: [],
      areas: [],
      technologies: [],
      isStudyGenerated: false,
      t,
      dsrCmResult: [],
    });

    expect(trajectoryUtils.buildRowWithSubRowsData).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should add DSR capacity modulation row', () => {
    vi.mocked(trajectoryUtils.buildRowWithSubRowsData).mockReturnValue({ id: 1 } as unknown as HypothesisRowData);
    vi.mocked(sortUtils.sortWithFixedPosition).mockReturnValue([{ id: 1 }] as unknown as HypothesisRowData[]);

    const result = buildHypothesisRows({
      trajType: TRAJECTORY_TYPE.DSR,
      trajectories: [{ id: 10 }] as DbTrajectory[],
      defaultAreas: [],
      areas: [],
      technologies: [],
      isStudyGenerated: false,
      t,
      dsrCmResult: [{ id: 99 }] as DbTrajectory[],
    });

    expect(result[result.length - 1]).toEqual({
      hypothesis: 'dsr.@capacityModulation',
      trajectory: { id: 99 },
      status: 'OK',
      isDefault: false,
      isDeletable: false,
      subRows: null,
    });
  });
});
