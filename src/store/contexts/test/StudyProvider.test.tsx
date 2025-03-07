import { afterEach, beforeEach, describe, it, Mock, vi } from 'vitest';
import { useLocation } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import { mockStudy } from '@/mocks/data/list/study.ts';
import { StudyProvider } from '@/store/contexts/StudyProvider.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useStudyDispatch } from '@/store/contexts/StudyContext.tsx';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { mockResponseGetTrajectoryFromStudy } from '@/mocks/data/list/trajectory.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});
vi.mock('@/shared/services/trajectoryService', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    getStudyTrajectories: vi.fn(),
  };
});
vi.mock('@/store/contexts/StudyContext', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useStudy: vi.fn(),
    useStudyDispatch: vi.fn(() => ({
      dispatch: vi.fn(),
    })),
  };
});

describe('StudyProvider', () => {
  const mockUseLocation = useLocation as Mock<typeof useLocation>;
  const mockUseStudyDispatch = useStudyDispatch as Mock<typeof useStudyDispatch>;
  const mockDispatch = vi.fn().mockImplementation(vi.fn());

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should update study context when study is linked to trajectories', async () => {
    vi.mocked(trajectoryService.getStudyTrajectories).mockResolvedValueOnce(mockResponseGetTrajectoryFromStudy);
    mockUseLocation.mockImplementationOnce(vi.fn().mockReturnValue({ state: { study: mockStudy } }));
    mockUseStudyDispatch.mockReturnValue(mockDispatch);

    //act(() => {
    // eslint-disable-next-line react/no-children-prop
    render(<StudyProvider children={<div></div>} initialValue={{ isStudyGenerated: false }}></StudyProvider>);
    //});

    await waitFor(() => {
      expect(trajectoryService.getStudyTrajectories).toHaveBeenCalledWith([mockStudy.id], TRAJECTORY_TYPE.AREA);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: mockResponseGetTrajectoryFromStudy,
      });
    });
  });
});
