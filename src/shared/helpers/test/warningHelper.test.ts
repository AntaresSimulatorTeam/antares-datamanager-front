import { Mock } from 'vitest';
import { mockDataMessage } from '@/mocks/data/tests/warning.mock.ts';
import { StudyState } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { mockDbTrajectory, mockDbTrajectoryAREA, mockDbTrajectoryLINK } from '@/mocks/data/tests/trajectory.mock.ts';
import { buildDataWarningMessage } from '@/shared/utils/warningUtils.ts';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { buildWarningMessages } from '@/shared/helpers/warningHelper.ts';

describe('buildWarningMessages', async () => {
  vi.mock('@/shared/utils/warningUtils.ts', async (importOriginal) => {
    const actual: Mock = await importOriginal();
    return {
      ...actual,
      buildDataWarningMessage: vi.fn(),
    };
  });
  const warningUtils = await import('@/shared/utils/warningUtils.ts');

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return messages from buildMessagesByType for a given tab', () => {
    (warningUtils.buildDataWarningMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue([mockDataMessage]);

    const state: Partial<StudyState> = {
      studyStatus: StudyStatus.IN_PROGRESS,
      AREA: [mockDbTrajectory],
    };

    const result = buildWarningMessages(state, TRAJECTORY_TYPE.AREA);

    expect(warningUtils.buildDataWarningMessage).toHaveBeenCalledWith(mockDbTrajectory, TRAJECTORY_TYPE.AREA, true);
    expect(result).toEqual([mockDataMessage]);
  });

  it('should return only LINK messages if AREA has no messages', () => {
    (warningUtils.buildDataWarningMessage as unknown as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([]) // AREA
      .mockReturnValueOnce([mockDataMessage]); // LINK

    const state: Partial<StudyState> = {
      studyStatus: StudyStatus.IN_PROGRESS,
      AREA: [mockDbTrajectory],
      LINK: [mockDbTrajectory],
    };

    const result = buildWarningMessages(state, TRAJECTORY_TYPE.AREA);

    expect(result).toEqual([mockDataMessage]);
  });

  it('should concatenate AREA and LINK messages if both exist', () => {
    const areaMessage = { message: 'Area warning', severity: 'warning' };
    const linkMessage = { message: 'Link warning', severity: 'warning' };

    (buildDataWarningMessage as unknown as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce([areaMessage]) // AREA
      .mockReturnValueOnce([linkMessage]); // LINK

    const state: Partial<StudyState> = {
      studyStatus: StudyStatus.IN_PROGRESS,
      AREA: [mockDbTrajectoryAREA],
      LINK: [mockDbTrajectoryLINK],
    };

    const result = buildWarningMessages(state, TRAJECTORY_TYPE.AREA);

    expect(result).toEqual([areaMessage, linkMessage]);
  });

  it('should return an empty array if no trajectories exist', () => {
    const state: Partial<StudyState> = {
      studyStatus: StudyStatus.GENERATED,
    };

    const result = buildWarningMessages(state, TRAJECTORY_TYPE.AREA);

    expect(result).toEqual([]);
  });
});