import { Mock, vi } from 'vitest';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { HypothesisRowData } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { mockDbTrajectory } from '@/mocks/data/tests/trajectory.mock.ts';
import { getReadOnlyForGeneratedStudy } from '@/shared/helpers/hypothesisTableHelper.ts';
import { retrieveReadOnlyArea } from '@/shared/utils/trajectoryUtils.ts';

// mock trajectory utils
vi.mock('@/shared/utils/trajectoryUtils.ts', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    retrieveReadOnlyArea: vi.fn(() => ({ H1: true, H3: true })),
  };
});

describe('setReadOnlyForGeneratedStudy', () => {
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
