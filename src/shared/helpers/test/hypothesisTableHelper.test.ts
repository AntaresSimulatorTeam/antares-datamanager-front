import { Mock, vi } from 'vitest';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { DbTrajectory, HypothesisRowData, TrajectoryAreaData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { mockDbTrajectory } from '@/mocks/data/tests/trajectory.mock.ts';
import {
  collectTrajectoriesRecursively,
  findSpecificTrajectoryToDelete,
  getCheckedValues,
  getReadOnlyForGeneratedStudy,
  getSpecificTrajectories,
  shouldOpenDeletionModal,
} from '@/shared/helpers/hypothesisTableHelper.ts';
import { retrieveReadOnlyArea } from '@/shared/utils/trajectoryUtils.ts';

vi.mock('@/shared/utils/trajectoryUtils.ts', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    retrieveReadOnlyArea: vi.fn(() => ({ H1: true, H3: true })),
  };
});

describe('getReadOnlyForGeneratedStudy', () => {
  const mockReadOnlyResult: ReadOnlyObject = { H1: true, H3: true };

  it('should call setReadOnly with the result of retrieveReadOnlyArea for rows without trajectory', () => {
    const mockRetrieveReadOnlyArea = retrieveReadOnlyArea as Mock<typeof retrieveReadOnlyArea>;
    mockRetrieveReadOnlyArea.mockReturnValue(mockReadOnlyResult);
    const mockRows: HypothesisRowData[] = [
      { hypothesis: 'H1', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: 'H2', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
      { hypothesis: 'H3', trajectory: null, status: TRAJECTORY_SELECTION_STATUS.MISSING },
      { hypothesis: 'H4', trajectory: mockDbTrajectory, status: TRAJECTORY_SELECTION_STATUS.OK },
    ];

    const expectedHypotheses = ['H1', 'H3'];

    getReadOnlyForGeneratedStudy(mockRows);

    expect(retrieveReadOnlyArea).toHaveBeenCalledWith(mockRows, expectedHypotheses);
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
