import { describe, expect, it, vi } from 'vitest';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DbTrajectory, FetchResult, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { mockDbTrajectory } from '@/mocks/data/tests/trajectory.mock.ts';
import {
  buildHypothesisRows,
  buildPayload,
  buildReadOnlyMap,
  buildRowsByArea,
  buildRowsByType,
  collectTrajectoriesRecursively,
  computeDsrDataAndReadOnly,
  fetchAndNormalizeTrajectories,
  findSpecificTrajectoryToDelete,
  getCheckedValues,
  getHypothesisLabel,
  getInformationMessage,
  getNuclearHypothesisLabel,
  getParamForFetchFSTrajectory,
  getReadOnlyForGeneratedStudy,
  getSpecificTrajectories,
  shouldOpenDeletionModal,
  updateTableAfterCellDetach,
  updateTableAfterRowDeletion,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import * as trajectoryUtils from '@/shared/utils/trajectoryUtils.ts';
import * as hypothesisTableService from '@/shared/services/hypothesisTableService.ts';
import * as studyService from '@/shared/services/studyService.ts';
import * as defaultConfigService from '@/shared/services/defaultConfigService.ts';
import * as sortUtils from '@/shared/utils/sortUtils.ts';

import { TFunction } from 'i18next';
import { isParamModulationRequired } from '@/shared/services/trajectoryService.ts';
import { ThermalOptionsResults } from '@/mocks/data/list/names.ts';

vi.mock('@/shared/services/trajectoryService');
vi.mock('@/shared/services/hypothesisTableService');
vi.mock('@/shared/services/defaultConfigService');
vi.mock('@/shared/services/studyService');
vi.mock('@/shared/utils/trajectoryUtils');
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
    expect(getInformationMessage(3, undefined as unknown as TRAJECTORY_TYPE, '0', null)).toBeNull();
  });

  it('retourne le message thermal avec index = 1', () => {
    const result = getInformationMessage(5, TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, '0', null);

    expect(result).toEqual({
      messageKey: 'thermal.@paramModulationMessage',
      id: '1',
    });
  });

  it('retourne le message DSR avec index = nbRows - 1', () => {
    const result = getInformationMessage(4, TRAJECTORY_TYPE.DSR, '0', null);

    expect(result).toEqual({
      messageKey: 'dsr.@capacityModulationMessage',
      id: '3',
    });
  });

  it('retourne un index minimum de 0 pour DSR si nbRows <= 1', () => {
    expect(getInformationMessage(1, TRAJECTORY_TYPE.DSR, '0', null)).toEqual({
      messageKey: 'dsr.@capacityModulationMessage',
      id: '0',
    });

    expect(getInformationMessage(0, TRAJECTORY_TYPE.DSR, '0', null)).toEqual({
      messageKey: 'dsr.@capacityModulationMessage',
      id: '0',
    });
  });

  it('retourne le message HYDRO_SERIES avec id "1"', () => {
    const result = getInformationMessage(4, TRAJECTORY_TYPE.HYDRO_SERIES, '1', null);

    expect(result).toBeNull();
  });

  it('retourne le message HYDRO_SERIES avec id "1.0"', () => {
    const result = getInformationMessage(4, TRAJECTORY_TYPE.HYDRO_SERIES, '1.0', null);

    expect(result).toBeNull();
  });

  it('retourne le message HYDRO_SERIES avec id "1.1"', () => {
    const result = getInformationMessage(4, TRAJECTORY_TYPE.HYDRO_SERIES, '1.1', null);

    expect(result).toEqual({
      messageKey: 'hydro.@informationMessage',
      id: '1.1',
    });
  });

  it('retourne le message HYDRO_SERIES pour une subRow avec une trajectoire de type HYDRO_TECHNICAL_PARAMETERS"', () => {
    const technicalParametersTrajectory = {
      type: TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS,
      trajectoryName: 'BP_23',
    } as DbTrajectory;
    const result = getInformationMessage(4, TRAJECTORY_TYPE.HYDRO_SERIES, '0.1', technicalParametersTrajectory);

    expect(result).toEqual({
      messageKey: 'hydro.@informationMessage',
      id: '0.1',
    });
  });
});

describe('computeDsrDataAndReadOnly', () => {
  const modulationRow = {
    hypothesis: 'MODULATION',
    trajectory: { id: 999, type: TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION },
    status: TRAJECTORY_SELECTION_STATUS.OK,
  };

  // --------------------------------------------------------------------
  // 1. Aucune trajectoire spécifique → readOnly = true
  // --------------------------------------------------------------------
  it('met la modulation en readOnly si aucune trajectoire spécifique', () => {
    const prev = [modulationRow] as HypothesisRowData[];
    const sortedSpecific: HypothesisRowData[] = [];

    const { data, readOnlyPatch, indexesToClear } = computeDsrDataAndReadOnly(prev, sortedSpecific);

    expect(data).toEqual([modulationRow]);
    expect(readOnlyPatch).toEqual({ 0: true });
    expect(indexesToClear).toEqual([0]);
  });

  // --------------------------------------------------------------------
  // 2. Trajectoires spécifiques sans timeSeries → readOnly = true
  // --------------------------------------------------------------------
  it('met la modulation en readOnly si aucune trajectoire spécifique n’a hasTimeSeries = true', () => {
    const prev = [
      {
        hypothesis: 'H1',
        trajectory: { id: 1, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: false },
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
      modulationRow,
    ] as HypothesisRowData[];

    const sortedSpecific = [prev[0]];

    const { data, readOnlyPatch, indexesToClear } = computeDsrDataAndReadOnly(prev, sortedSpecific);

    expect(data).toEqual([prev[0], modulationRow]);
    expect(readOnlyPatch).toEqual({ 1: true });
    expect(indexesToClear).toEqual([1]);
  });

  // --------------------------------------------------------------------
  // 3. Au moins une trajectoire spécifique avec timeSeries = true → readOnly = false
  // --------------------------------------------------------------------
  it('met la modulation en writable si au moins une trajectoire spécifique a hasTimeSeries = true', () => {
    const prev = [
      {
        hypothesis: 'H1',
        trajectory: { id: 1, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: true },
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
      modulationRow,
    ] as HypothesisRowData[];

    const sortedSpecific = [prev[0]];

    const { data, readOnlyPatch, indexesToClear } = computeDsrDataAndReadOnly(prev, sortedSpecific);

    expect(data).toEqual([prev[0], modulationRow]);
    expect(readOnlyPatch).toEqual({ 1: false });
    expect(indexesToClear).toEqual([1]);
  });

  // --------------------------------------------------------------------
  // 4. Index shifting : old index supprimé, nouveau index ajouté
  // --------------------------------------------------------------------
  it('retourne l’ancien index à supprimer et le nouveau index à mettre à jour', () => {
    const prev = [
      {
        hypothesis: 'H1',
        trajectory: { id: 1, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: false },
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
      {
        hypothesis: 'H2',
        trajectory: { id: 2, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: false },
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
      modulationRow,
    ] as HypothesisRowData[];

    const sortedSpecific = [prev[0], prev[1]];

    const { data, readOnlyPatch, indexesToClear } = computeDsrDataAndReadOnly(prev, sortedSpecific);

    // La modulation doit être en dernière position
    expect(data).toEqual([prev[0], prev[1], modulationRow]);

    // L’ancien index était 2
    expect(indexesToClear).toEqual([2]);

    // Le nouveau index est aussi 2
    expect(readOnlyPatch).toEqual({ 2: true });
  });

  // --------------------------------------------------------------------
  // 5. Vérifie que la modulation est toujours la dernière ligne
  // --------------------------------------------------------------------
  it('place toujours la modulation en dernière ligne', () => {
    const prev = [
      {
        hypothesis: 'H1',
        trajectory: { id: 1, type: TRAJECTORY_TYPE.DSR, hasTimeSeries: false },
        status: TRAJECTORY_SELECTION_STATUS.OK,
      },
      modulationRow,
    ] as HypothesisRowData[];

    const sortedSpecific = [prev[0]];

    const { data } = computeDsrDataAndReadOnly(prev, sortedSpecific);

    expect(data[data.length - 1]).toEqual(modulationRow);
  });
});

describe('fetchAndNormalizeTrajectories (Vitest)', () => {
  const defaultAreas = [{ name: 'A' }, { name: 'B' }];
  const emptyAreaSelected = [{ id: 99, trajectoryName: '' }] as DbTrajectory[];

  afterEach(() => {
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

    vi.mocked(defaultConfigService.getThermalTechnologyList).mockResolvedValue(ThermalOptionsResults);

    vi.mocked(trajectoryUtils.buildDefaultEmptyTrajectoryList).mockReturnValue([
      { id: 11, trajectoryName: '' },
    ] as DbTrajectory[]);

    vi.mocked(trajectoryUtils.removeDuplicateByTechnology).mockReturnValueOnce([
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
      technologies: ThermalOptionsResults,
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

    vi.mocked(trajectoryUtils.removeDuplicateByTechnology).mockReturnValueOnce([
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

  // ---------------------------------------------------------
  // CASE 5 — Hydro type
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
      trajType: TRAJECTORY_TYPE.HYDRO_SERIES,
      defaultAreas,
      emptyAreaSelected,
    });

    expect(result).toEqual({
      // TODO : test trajectories result when import is implemented
      trajectories: undefined,
      dsrCmResult: [],
      technologies: [
        { id: 1, label: 'Series', code: 'Series' },
        { id: 2, label: 'Technical parameters', code: 'Technical parameters' },
      ],
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
  afterEach(() => {
    vi.clearAllMocks();
  });

  const rows = [
    { status: 'OK', trajectory: { area: 'FR', hasTimeSeries: true } },
    { status: 'MISSING' },
  ] as HypothesisRowData[];

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
    expect(trajectoryUtils.generateReadOnlyIndexMap).toHaveBeenCalledWith(rows);
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
    expect(trajectoryUtils.retrieveReadOnlyArea).toHaveBeenCalledWith(rows, defaultAreaListNotInList);
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
      1: false, // car au moins un row.status === OK et hasTimeSeries at TRUE
    });
  });

  it('should not add DSR-specific readonly rule if trajectory oK but hasTimeSeries false', () => {
    vi.mocked(trajectoryUtils.retrieveReadOnlyArea).mockReturnValue({ 0: false });
    const rowsNoTS = [
      { status: 'OK', trajectory: { area: 'FR', hasTimeSeries: false } },
      { status: 'MISSING' },
    ] as HypothesisRowData[];

    const result = buildReadOnlyMap({
      rows: rowsNoTS,
      trajType: TRAJECTORY_TYPE.DSR,
      isStudyGenerated: false,
      defaultAreaListNotInList,
    });

    // dernière ligne = index 1
    expect(result).toEqual({
      0: false,
      1: true,
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
  afterEach(() => {
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
    vi.mocked(trajectoryUtils.convertIntoHypothesisRowWithTechnologies).mockReturnValue({
      id: 1,
    } as unknown as HypothesisRowData[]);
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

    expect(trajectoryUtils.convertIntoHypothesisRowWithTechnologies).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should add DSR capacity modulation row', () => {
    vi.mocked(trajectoryUtils.convertIntoHypothesisRowWithTechnologies).mockReturnValue({
      id: 1,
    } as unknown as HypothesisRowData[]);
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

// vi.mock('@/shared/services/trajectoryService.ts', () => ({
//   isParamModulationRequired: vi.fn(),
// }));
//
// vi.mock('@/shared/utils/sortUtils', () => ({
//   sortWithFixedPosition: vi.fn(),
// }));

describe('updateTableAfterRowDeletion', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // THERMAL
  // ---------------------------------------------------------------------------
  describe('THERMAL_TECHNICAL_SPECIFIC_PARAMETER', () => {
    it('supprime la subRow + remet la modulation à MISSING si deletedModulation = true', async () => {
      const data = [
        {
          subRows: [
            { hypothesis: 'H1', value: 1 },
            { hypothesis: 'H2', value: 2 },
          ],
        },
        {
          status: 'OK',
          trajectory: { id: 99 },
        },
        { foo: 'bar' },
      ] as HypothesisRowData[];

      vi.mocked(isParamModulationRequired).mockResolvedValue(false);

      const result = await updateTableAfterRowDeletion({
        type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
        data,
        hypothesis: 'H1',
        trajectoryIds: [99, 10], // modulation + specific
        studyId: 42,
        horizon: '2030',
      });

      expect(result.newData).toEqual([
        {
          ...data[0],
          subRows: [{ hypothesis: 'H2', value: 2 }],
        },
        {
          ...data[1],
          trajectory: null,
          status: TRAJECTORY_SELECTION_STATUS.MISSING,
        },
        data[2],
      ]);

      expect(result.newReadOnly).toEqual({ '1': true });
    });

    it('supprime seulement la subRow si deletedModulation = false', async () => {
      const data = [
        {
          subRows: [
            { hypothesis: 'H1', value: 1 },
            { hypothesis: 'H2', value: 2 },
          ],
        },
        { hypothesis: 'bar' },
      ] as HypothesisRowData[];

      vi.mocked(isParamModulationRequired).mockResolvedValue(true);

      const result = await updateTableAfterRowDeletion({
        type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
        data,
        hypothesis: 'H1',
        trajectoryIds: [10], // pas de modulation
        studyId: 42,
        horizon: '2030',
      });

      expect(result.newData).toEqual([
        {
          ...data[0],
          subRows: [{ hypothesis: 'H2', value: 2 }],
        },
        data[1],
      ]);

      expect(result.newReadOnly).toEqual({ '1': false });
    });
  });

  // ---------------------------------------------------------------------------
  // DSR
  // ---------------------------------------------------------------------------
  describe('DSR', () => {
    it('filtre, trie et applique computeDsrDataAndReadOnly', async () => {
      const data = [
        { hypothesis: 'H1' },
        { hypothesis: 'H2' },
        { hypothesis: 'MODULATION' }, // last row
      ] as HypothesisRowData[];

      const sorted = [{ hypothesis: 'H2' }] as HypothesisRowData[];

      vi.mocked(sortUtils.sortWithFixedPosition).mockReturnValue(sorted);

      const result = await updateTableAfterRowDeletion({
        type: TRAJECTORY_TYPE.DSR,
        data,
        hypothesis: 'H1',
        trajectoryIds: [10],
        studyId: 42,
        horizon: '2030',
      });

      expect(result).toEqual({
        newData: [
          { hypothesis: 'H2' },
          { hypothesis: 'MODULATION' }, // last row
        ],
        newReadOnly: { '1': true },
        indexesToClear: [2],
      });
    });
  });

  // ---------------------------------------------------------------------------
  // GENERIC
  // ---------------------------------------------------------------------------
  describe('GENERIC', () => {
    it('filtre et trie les lignes', async () => {
      const data = [{ hypothesis: 'H1' }, { hypothesis: 'H2' }] as HypothesisRowData[];

      const sorted = [{ hypothesis: 'H2' }] as HypothesisRowData[];

      vi.mocked(sortUtils.sortWithFixedPosition).mockReturnValue(sorted);

      const result = await updateTableAfterRowDeletion({
        type: TRAJECTORY_TYPE.STS,
        data,
        hypothesis: 'H1',
        trajectoryIds: [10],
        studyId: 42,
        horizon: '2030',
      });

      expect(result).toEqual({ newData: sorted });
    });
  });
});

describe('updateTableAfterCellDetach', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // THERMAL
  // ---------------------------------------------------------------------------
  describe('THERMAL_TECHNICAL_SPECIFIC_PARAMETER', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('détache la cellule + remet la modulation à MISSING si additionalTrajectory est une modulation', async () => {
      const data = [{ hypothesis: 'H1' }, { hypothesis: 'H2' }, { hypothesis: 'H3' }] as HypothesisRowData[];

      const indexArray = [1];

      const additionalTrajectory = {
        type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_MODULATION_PARAMETER,
      } as DbTrajectory;

      const empty = {
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
      };

      const baseData = [{ ...data[0] }, { ...data[1], ...empty }, data[2]];

      vi.mocked(trajectoryUtils.setNestedData).mockReturnValue(['updated'] as unknown as HypothesisRowData[]);
      vi.mocked(isParamModulationRequired).mockResolvedValue(false);

      const result = await updateTableAfterCellDetach({
        type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
        data,
        additionalTrajectory,
        indexArray,
        studyId: 42,
        horizon: '2030',
      });

      expect(trajectoryUtils.setNestedData).toHaveBeenCalledWith(baseData, indexArray, empty);

      expect(result).toEqual({
        newData: ['updated'],
        newReadOnly: { '1': true },
      });
    });

    it('détache la cellule sans toucher à la modulation si additionalTrajectory n’est pas une modulation', async () => {
      const data = [{ hypothesis: 'H1' }, { hypothesis: 'H2' }] as HypothesisRowData[];

      const indexArray = [0];

      const additionalTrajectory = { type: TRAJECTORY_TYPE.LOAD } as DbTrajectory;

      const empty = {
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
      };

      vi.mocked(trajectoryUtils.setNestedData).mockReturnValue(['updated'] as unknown as HypothesisRowData[]);
      vi.mocked(isParamModulationRequired).mockResolvedValue(true);

      const result = await updateTableAfterCellDetach({
        type: TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
        data,
        additionalTrajectory,
        indexArray,
        studyId: 42,
        horizon: '2030',
      });

      expect(trajectoryUtils.setNestedData).toHaveBeenCalledWith(data, indexArray, empty);

      expect(result).toEqual({
        newData: ['updated'],
        newReadOnly: { '1': false },
      });
    });
  });

  // ---------------------------------------------------------------------------
  // DSR
  // ---------------------------------------------------------------------------
  describe('DSR', () => {
    it('met à jour la cellule, trie les spécifiques et applique computeDsrDataAndReadOnly', async () => {
      const data = [{ hypothesis: 'H1' }, { hypothesis: 'H2' }, { hypothesis: 'MODULATION' }] as HypothesisRowData[];

      const indexArray = [1];

      const empty = {
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
      };

      const updated = ['updated'] as unknown as HypothesisRowData[];
      const sortedSpecific = ['sorted'] as unknown as HypothesisRowData[];

      vi.mocked(trajectoryUtils.setNestedData).mockReturnValue(updated);
      vi.mocked(sortUtils.sortWithFixedPosition).mockReturnValue(sortedSpecific);

      const result = await updateTableAfterCellDetach({
        type: TRAJECTORY_TYPE.DSR,
        data,
        additionalTrajectory: null,
        indexArray,
        studyId: 42,
        horizon: '2030',
      });

      expect(trajectoryUtils.setNestedData).toHaveBeenCalledWith(data, indexArray, empty);
      expect(sortUtils.sortWithFixedPosition).toHaveBeenCalledWith(updated.slice(0, -1));

      expect(result).toEqual({
        newData: ['sorted', 'updated'],
        newReadOnly: { 1: true },
      });
    });
  });

  describe('AREA', () => {
    it('détache la 1ère cellule', async () => {
      const data = [
        { hypothesis: 'H1', trajectory: { trajectoryName: 'name', area: 'H1' } },
        { hypothesis: 'H2' },
      ] as HypothesisRowData[];

      const indexArray = [0];

      const result = await updateTableAfterCellDetach({
        type: TRAJECTORY_TYPE.AREA,
        data,
        additionalTrajectory: null,
        indexArray,
        studyId: 42,
        horizon: '2030',
      });

      expect(result).toEqual({
        newData: [
          { hypothesis: 'H1', status: TRAJECTORY_SELECTION_STATUS.MISSING, trajectory: null },
          { hypothesis: 'H2' },
        ],
        newReadOnly: { '0': false, '1': true },
      });
    });

    it('détache la 2nd cellule', async () => {
      const data = [
        { hypothesis: 'H1', trajectory: { trajectoryName: 'name', area: 'H1' } },
        { hypothesis: 'H2', trajectory: { trajectoryName: 'name', area: 'H2' } },
      ] as HypothesisRowData[];

      const indexArray = [1];

      const result = await updateTableAfterCellDetach({
        type: TRAJECTORY_TYPE.AREA,
        data,
        additionalTrajectory: null,
        indexArray,
        studyId: 42,
        horizon: '2030',
      });

      expect(result).toEqual({
        newData: [
          {
            hypothesis: 'H1',
            trajectory: { trajectoryName: 'name', area: 'H1' },
          },
          { hypothesis: 'H2', status: TRAJECTORY_SELECTION_STATUS.MISSING, trajectory: null },
        ],
        newReadOnly: { '0': false, '1': false },
      });
    });

    it('détache la 1ère cellule + détache la 2nd si elle est présente', async () => {
      const data = [
        { hypothesis: 'H1', trajectory: { trajectoryName: 'name', area: 'H1' } },
        { hypothesis: 'H2', trajectory: { trajectoryName: 'name', area: 'H2' } },
      ] as HypothesisRowData[];

      const indexArray = [0];

      const result = await updateTableAfterCellDetach({
        type: TRAJECTORY_TYPE.AREA,
        data,
        additionalTrajectory: null,
        indexArray,
        studyId: 42,
        horizon: '2030',
      });

      expect(result).toEqual({
        newData: [
          { hypothesis: 'H1', status: TRAJECTORY_SELECTION_STATUS.MISSING, trajectory: null },
          { hypothesis: 'H2', status: TRAJECTORY_SELECTION_STATUS.MISSING, trajectory: null },
        ],
        newReadOnly: { '0': false, '1': true },
      });
    });
  });

  // ---------------------------------------------------------------------------
  // GENERIC
  // ---------------------------------------------------------------------------
  describe('GENERIC', () => {
    it('met à jour la cellule sans logique supplémentaire', async () => {
      const data = [{ hypothesis: 'H1' }, { hypothesis: 'H2' }] as HypothesisRowData[];

      const indexArray = [0];

      const empty = {
        trajectory: null,
        status: TRAJECTORY_SELECTION_STATUS.MISSING,
      };

      vi.mocked(trajectoryUtils.setNestedData).mockReturnValue(['updated'] as unknown as HypothesisRowData[]);

      const result = await updateTableAfterCellDetach({
        type: TRAJECTORY_TYPE.STS,
        data,
        additionalTrajectory: null,
        indexArray,
        studyId: 42,
        horizon: '2030',
      });

      expect(trajectoryUtils.setNestedData).toHaveBeenCalledWith(data, indexArray, empty);

      expect(result).toEqual({
        newData: ['updated'],
      });
    });
  });
});

describe('getParamForFetchFSTrajectory', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('return AREA type when index table is not the last one', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.AREA, [0], 2, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.AREA);
    expect(areaToUse).toEqual('');
  });

  it('return LINK type when index table is the last one', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.AREA, [1], 2, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.LINK);
    expect(areaToUse).toEqual('');
  });

  it('return LOAD type when LOAD is called', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.LOAD, [1], 2, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.LOAD);
    expect(areaToUse).toEqual('H2');
  });

  it('return THERMAL_CAPACITY type when THERMAL_CAPACITY is called', () => {
    const { typeToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.THERMAL_CAPACITY, [1], 2, {
      area: 'H2',
      technology: 'CCGT',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.THERMAL_CAPACITY);
  });

  it('return THERMAL_TECHNICAL_SPECIFIC_PARAMETER type when THERMAL_TECHNICAL_SPECIFIC_PARAMETER is called', () => {
    const { typeToUse } = getParamForFetchFSTrajectory(
      TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER,
      [0, 1],
      2,
      {
        area: 'H2',
        technology: 'CCGT',
        isDefault: false,
      },
    );
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER);
  });

  it('return THERMAL_TECHNICAL_MODULATION_PARAMETER type when THERMAL_TECHNICAL_SPECIFIC_PARAMETER is called for the second line', () => {
    getParamForFetchFSTrajectory(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, [1], 3, {
      area: 'H2',
      technology: 'CCGT',
      isDefault: false,
    });
    expect(trajectoryUtils.getTrajectoryTypeByIndex).toHaveBeenCalledWith(1);
  });

  it('return THERMAL_TECHNICAL_COMMON_PARAMETER type when THERMAL_TECHNICAL_COMMON_PARAMETER is called', () => {
    getParamForFetchFSTrajectory(TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER, [2], 3, {
      area: 'H2',
      technology: 'CCGT',
      isDefault: false,
    });
    expect(trajectoryUtils.getTrajectoryTypeByIndex).toHaveBeenCalledWith(2);
  });

  it('return THERMAL_ECONOMIC_COST_PARAMETER type when THERMAL_ECONOMIC_COST_PARAMETER is called', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(
      TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER,
      [0],
      2,
      {
        area: 'H2',
        technology: 'CCGT',
        isDefault: false,
      },
    );
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER);
    expect(areaToUse).toEqual('');
  });

  it('return THERMAL_ECONOMIC_PARAMETER type when THERMAL_ECONOMIC_PARAMETER is called', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(
      TRAJECTORY_TYPE.THERMAL_ECONOMIC_COST_PARAMETER,
      [1],
      2,
      {
        area: 'H2',
        technology: 'CCGT',
        isDefault: false,
      },
    );
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.THERMAL_ECONOMIC_PARAMETER);
    expect(areaToUse).toEqual('');
  });

  it('return DSR type when index table is not the last one', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.DSR, [1], 3, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.DSR);
    expect(areaToUse).toEqual('');
  });

  it('return DSR_CAPACITY_MODULATION type when index table is the last one', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.DSR, [2], 3, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.DSR_CAPACITY_MODULATION);
    expect(areaToUse).toEqual('');
  });

  it('return HYDRO_TECHNICAL_PARAMETERS type when index table is the last one', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.HYDRO_SERIES, [0, 1], 2, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS);
    expect(areaToUse).toEqual('');
  });

  it('return HYDRO_PSP_TECHNICAL_PARAMETERS type when index table is the last one', () => {
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.HYDRO_PSP_SERIES, [0, 1], 2, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS);
    expect(areaToUse).toEqual('');
  });

  it('return NUCLEAR_FR_MODULATION type when index table is the last one', () => {
    vi.mocked(trajectoryUtils.getFetchParams).mockReturnValue({
      typeToUse: TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION,
      areaToUse: '',
    });
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [0], 3, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION);
    expect(areaToUse).toEqual('');
  });

  it('return NUCLEAR_FR_TALON type when index table is the last one', () => {
    vi.mocked(trajectoryUtils.getFetchParams).mockReturnValue({
      typeToUse: TRAJECTORY_TYPE.NUCLEAR_FR_TALON,
      areaToUse: '',
    });
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [1], 3, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.NUCLEAR_FR_TALON);
    expect(areaToUse).toEqual('');
  });

  it('return NUCLEAR_FR_TS_ERP type when index table is the last one', () => {
    vi.mocked(trajectoryUtils.getFetchParams).mockReturnValue({
      typeToUse: TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP,
      areaToUse: '',
    });
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [2, 0], 3, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP);
    expect(areaToUse).toEqual('');
  });

  it('return NUCLEAR_FR_TS_LONG_TERM type when index table is the last one', () => {
    vi.mocked(trajectoryUtils.getFetchParams).mockReturnValue({
      typeToUse: TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM,
      areaToUse: '',
    });
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [2, 1], 3, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM);
    expect(areaToUse).toEqual('');
  });

  it('return NUCLEAR_FR_TS_SMR type when index table is the last one', () => {
    vi.mocked(trajectoryUtils.getFetchParams).mockReturnValue({
      typeToUse: TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR,
      areaToUse: '',
    });
    const { typeToUse, areaToUse } = getParamForFetchFSTrajectory(TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, [2, 2], 3, {
      area: 'H2',
      isDefault: false,
    });
    expect(typeToUse).toEqual(TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR);
    expect(areaToUse).toEqual('');
  });
});

describe('getNuclearHypothesisLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return thermal.@epr for NUCLEAR_FR_TS_ERP', () => {
    const mockTranslate = vi.fn((key: string) => {
      if (key === 'thermal.@epr') return 'EPR';
      return key;
    }) as unknown as TFunction<'translation', undefined>;
    const result = getNuclearHypothesisLabel(TRAJECTORY_TYPE.NUCLEAR_FR_TS_ERP, mockTranslate);

    expect(mockTranslate).toHaveBeenCalledWith('thermal.@epr');
    expect(result).toBe('EPR');
  });

  it('should return thermal.@long_term for NUCLEAR_FR_TS_LONG_TERM', () => {
    const mockTranslate = vi.fn((key: string) => {
      if (key === 'thermal.@long_term') return 'Long Term';
      return key;
    }) as unknown as TFunction<'translation', undefined>;
    const result = getNuclearHypothesisLabel(TRAJECTORY_TYPE.NUCLEAR_FR_TS_LONG_TERM, mockTranslate);

    expect(mockTranslate).toHaveBeenCalledWith('thermal.@long_term');
    expect(result).toBe('Long Term');
  });

  it('should return thermal.@smr for any other type', () => {
    const mockTranslate = vi.fn((key: string) => {
      if (key === 'thermal.@smr') return 'SMR';
      return key;
    }) as unknown as TFunction<'translation', undefined>;
    const result = getNuclearHypothesisLabel(TRAJECTORY_TYPE.NUCLEAR_FR_TS_SMR, mockTranslate);

    expect(mockTranslate).toHaveBeenCalledWith('thermal.@smr');
    expect(result).toBe('SMR');
  });
});

describe('getHypothesisLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return thermal.@parametersTechnical for HYDRO_TECHNICAL_PARAMETERS', () => {
    const mockT = vi.fn((key: string) => {
      if (key === 'thermal.@parametersTechnical') return 'Technical Parameters';
      if (key === 'hydro.@series') return 'Series';
      if (key === 'thermal.@smr') return 'SMR';
      return key;
    }) as unknown as TFunction<'translation', undefined>;
    const result = getHypothesisLabel(TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS, mockT);

    expect(mockT).toHaveBeenCalledWith('thermal.@parametersTechnical');
    expect(result).toBe('Technical Parameters');
  });

  it('should return thermal.@parametersTechnical for HYDRO_PSP_TECHNICAL_PARAMETERS', () => {
    const mockT = vi.fn((key: string) => {
      if (key === 'thermal.@parametersTechnical') return 'Technical Parameters';
      if (key === 'hydro.@series') return 'Series';
      if (key === 'thermal.@smr') return 'SMR';
      return key;
    }) as unknown as TFunction<'translation', undefined>;
    const result = getHypothesisLabel(TRAJECTORY_TYPE.HYDRO_PSP_TECHNICAL_PARAMETERS, mockT);

    expect(mockT).toHaveBeenCalledWith('thermal.@parametersTechnical');
    expect(result).toBe('Technical Parameters');
  });

  it('should return hydro.@series for HYDRO_SERIES', () => {
    const mockT = vi.fn((key: string) => {
      if (key === 'thermal.@parametersTechnical') return 'Technical Parameters';
      if (key === 'hydro.@series') return 'Series';
      if (key === 'thermal.@smr') return 'SMR';
      return key;
    }) as unknown as TFunction<'translation', undefined>;
    const result = getHypothesisLabel(TRAJECTORY_TYPE.HYDRO_SERIES, mockT);

    expect(mockT).toHaveBeenCalledWith('hydro.@series');
    expect(result).toBe('Series');
  });

  it('should return hydro.@series for HYDRO_PSP_SERIES', () => {
    const mockT = vi.fn((key: string) => {
      if (key === 'hydro.@series') return 'Series';
      return key;
    }) as unknown as TFunction<'translation', undefined>;
    const result = getHypothesisLabel(TRAJECTORY_TYPE.HYDRO_PSP_SERIES, mockT);

    expect(mockT).toHaveBeenCalledWith('hydro.@series');
    expect(result).toBe('Series');
  });

  it('should return hydro.@series for any other type (default)', () => {
    const mockT = vi.fn((key: string) => {
      if (key === 'hydro.@series') return 'Series';
      return key;
    }) as unknown as TFunction<'translation', undefined>;
    const result = getHypothesisLabel('UNKNOWN_TYPE' as unknown as TRAJECTORY_TYPE, mockT);

    expect(mockT).toHaveBeenCalledWith('hydro.@series');
    expect(result).toBe('Series');
  });
});

describe('buildRowsByArea', () => {
  it('should build rows with missing status when no trajectory exists', () => {
    const areas = ['Area 1'];
    const subRowTypes = [TRAJECTORY_TYPE.HYDRO_SERIES, TRAJECTORY_TYPE.HYDRO_TECHNICAL_PARAMETERS];

    const trajectoriesByType = [] as unknown as FetchResult[]; // aucun résultat

    const t = vi.fn((key: string) => {
      if (key === 'thermal.@parametersTechnical') return 'Technical Parameters';
      if (key === 'hydro.@series') return 'Series';
      return key;
    }) as unknown as TFunction<'translation', undefined>;

    const result = buildRowsByArea({
      areas,
      subRowTypes,
      trajectoriesByType,
      t,
    });

    expect(result).toHaveLength(1);
    const row = result[0];

    expect(row.hypothesis).toBe('Area 1');
    expect(row.status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(row.subRows).toHaveLength(2);

    row.subRows?.forEach((subRow, index) => {
      expect(subRow.hypothesis).toBe(index === 0 ? 'Series' : 'Technical Parameters');
      expect(subRow.trajectory).toBeNull();
      expect(subRow.status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    });
  });

  it('should assign trajectory when matching type exists', () => {
    const areas = ['Area X'];
    const subRowTypes = [TRAJECTORY_TYPE.HYDRO_SERIES];

    const trajectoriesByType = [
      {
        trajType: TRAJECTORY_TYPE.HYDRO_SERIES,
        trajectories: [{ trajectoryName: 'Trajectory A1' }],
      },
    ] as unknown as FetchResult[];

    const t = vi.fn((key: string) => key as unknown as string) as unknown as TFunction<'translation', undefined>;

    const result = buildRowsByArea({
      areas,
      subRowTypes,
      trajectoriesByType,
      t,
    });

    const subRow = result[0].subRows?.[0];

    expect(subRow?.trajectory).toEqual({ trajectoryName: 'Trajectory A1' });
    expect(subRow?.status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
  });

  it('should set status MISSING when trajectory exists but has no name', () => {
    const areas = ['Area Z'];
    const subRowTypes = [TRAJECTORY_TYPE.HYDRO_SERIES];

    const trajectoriesByType = [
      {
        trajType: TRAJECTORY_TYPE.HYDRO_SERIES,
        trajectories: [
          { trajectoryName: '' }, // pas de nom → MISSING
        ],
      },
    ] as unknown as FetchResult[];

    const t = vi.fn((key: string) => key as unknown as string) as unknown as TFunction<'translation', undefined>;

    const result = buildRowsByArea({
      areas,
      subRowTypes,
      trajectoriesByType,
      t,
    });

    const subRow = result[0].subRows?.[0];

    expect(subRow?.status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
  });
});

vi.mock('@/utils/getNuclearHypothesisLabel', () => ({
  getNuclearHypothesisLabel: vi.fn((type) => `label-${type}`),
}));

describe('buildRowsByType', () => {
  it('should build parent rows with correct hypothesis labels', () => {
    const rowTypes = [TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION, TRAJECTORY_TYPE.NUCLEAR_FR_TALON];

    const subRowTypes = [] as TRAJECTORY_TYPE[];

    const trajectoriesByType = [] as unknown as FetchResult[];

    const t = vi.fn((key: string) => {
      if (key === 'thermal.@epr') return 'modulation';
      if (key === 'thermal.@talon') return 'talon';
      return key;
    }) as unknown as TFunction<'translation', undefined>;

    const result = buildRowsByType({
      rowTypes,
      subRowTypes,
      trajectoriesByType,
      t,
    });

    expect(result).toHaveLength(3); // 2 parents + 1 time_series row

    expect(result[0].hypothesis).toBe('thermal.@modulation');
    expect(result[1].hypothesis).toBe('talon');
  });

  it('should assign trajectory and status OK when trajectory exists', () => {
    const rowTypes = [TRAJECTORY_TYPE.NUCLEAR_FR_TALON];
    const subRowTypes = [] as TRAJECTORY_TYPE[];

    const trajectoriesByType = [
      {
        trajType: TRAJECTORY_TYPE.NUCLEAR_FR_TALON,
        trajectories: [{ trajectoryName: 'Talon Traj' }],
      },
    ] as unknown as FetchResult[];

    const t = vi.fn((key: string) => {
      if (key === 'thermal.@epr') return 'modulation';
      if (key === 'thermal.@talon') return 'talon';
      return key;
    }) as unknown as TFunction<'translation', undefined>;

    const result = buildRowsByType({
      rowTypes,
      subRowTypes,
      trajectoriesByType,
      t,
    });

    const parent = result[0];

    expect(parent.trajectory).toEqual({ trajectoryName: 'Talon Traj' });
    expect(parent.status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
  });

  it('should set status MISSING when no trajectory exists', () => {
    const rowTypes = [TRAJECTORY_TYPE.NUCLEAR_FR_TALON];
    const subRowTypes = [] as TRAJECTORY_TYPE[];

    const trajectoriesByType = [] as unknown as FetchResult[]; // aucun résultat

    const t = vi.fn((key: string) => {
      if (key === 'thermal.@epr') return 'modulation';
      if (key === 'thermal.@talon') return 'talon';
      return key;
    }) as unknown as TFunction<'translation', undefined>;

    const result = buildRowsByType({
      rowTypes,
      subRowTypes,
      trajectoriesByType,
      t,
    });

    expect(result[0].trajectory).toBeNull();
    expect(result[0].status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
  });

  it('should build subRows correctly with labels and statuses', () => {
    const rowTypes = [] as TRAJECTORY_TYPE[];
    const subRowTypes = [TRAJECTORY_TYPE.NUCLEAR_FR_TALON];

    const trajectoriesByType = [
      {
        trajType: TRAJECTORY_TYPE.NUCLEAR_FR_TALON,
        trajectories: [{ trajectoryName: 'Sub Traj' }],
      },
    ] as unknown as FetchResult[];

    const t = vi.fn((key: string) => {
      if (key === 'thermal.@epr') return 'modulation';
      if (key === 'thermal.@talon') return 'talon';
      return key;
    }) as unknown as TFunction<'translation', undefined>;

    const result = buildRowsByType({
      rowTypes,
      subRowTypes,
      trajectoriesByType,
      t,
    });

    const timeSeriesRow = result[result.length - 1];
    const subRow = timeSeriesRow.subRows![0];

    expect(subRow.trajectory).toEqual({ trajectoryName: 'Sub Traj' });
    expect(subRow.status).toBe(TRAJECTORY_SELECTION_STATUS.OK);
  });

  it('should add a final time_series parent row with missing status', () => {
    const rowTypes = [] as TRAJECTORY_TYPE[];
    const subRowTypes = [] as TRAJECTORY_TYPE[];

    const trajectoriesByType = [] as unknown as FetchResult[];

    const t = vi.fn((key: string) => {
      if (key === 'thermal.@epr') return 'modulation';
      if (key === 'thermal.@talon') return 'talon';
      return key;
    }) as unknown as TFunction<'translation', undefined>;

    const result = buildRowsByType({
      rowTypes,
      subRowTypes,
      trajectoriesByType,
      t,
    });

    const lastRow = result[result.length - 1];

    expect(lastRow.hypothesis).toBe('thermal.@time_series');
    expect(lastRow.trajectory).toBeNull();
    expect(lastRow.status).toBe(TRAJECTORY_SELECTION_STATUS.MISSING);
    expect(lastRow.subRows).toEqual([]);
  });
});
