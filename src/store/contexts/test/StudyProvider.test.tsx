import { afterEach, beforeEach, describe, it, Mock, vi } from 'vitest';
import { useLocation } from 'react-router-dom';
import { act, render, waitFor } from '@testing-library/react';
import { mockStudy } from '@/mocks/data/list/study.ts';
import { StudyProvider } from '@/store/contexts/StudyProvider.tsx';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { STUDY_ACTION } from '@/shared/enum/study.ts';
import { mockResponseGetTrajectoryFromStudy } from '@/mocks/data/list/trajectory.ts';
import * as trajectoryService from '@/shared/services/trajectoryService.ts';
import { useReducer } from 'react';
import { ProviderTestChildComponent } from '@/store/contexts/test/components/ProviderTestChildComponent.tsx';

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
// vi.mock('@/store/contexts/StudyContext', async (importOriginal) => {
//   const actual: Mock = await importOriginal();
//   return {
//     ...actual,
//     useStudy: vi.fn(),
//     // useStudyDispatch: vi.fn(() => ({
//     //   dispatch: vi.fn(),
//     // })),
//   };
// });

vi.mock('react', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useStudy: vi.fn(),
    // useStudyDispatch: vi.fn(() => ({
    //   dispatch: vi.fn(),
    // })),
  };
});

vi.mock('react', async (importOriginal) => {
  const actual: Mock = await importOriginal();
  return {
    ...actual,
    useReducer: vi.fn(),
    //useContext: vi.fn(),
  };
});

describe('StudyProvider', () => {
  const mockUseLocation = useLocation as Mock<typeof useLocation>;
  //const mockUseStudy = useStudy as Mock<typeof useStudy>;
  const mockUseReducer = useReducer as unknown as Mock<typeof useReducer>;
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
    mockUseReducer.mockImplementation(() => [
      {
        isStudyGenerated: false,
      },
      mockDispatch,
    ]);

    // eslint-disable-next-line react/no-children-prop
    const provider = <StudyProvider children={<ProviderTestChildComponent />}></StudyProvider>;
    const { getByTestId, rerender } = render(provider);

    await waitFor(() => {
      expect(trajectoryService.getStudyTrajectories).toHaveBeenCalledWith(mockStudy.id, TRAJECTORY_TYPE.AREA);
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: STUDY_ACTION.ADD_TRAJECTORIES,
        payload: mockResponseGetTrajectoryFromStudy,
      });
    });

    act(() => rerender(provider));

    await waitFor(() => {
      expect(getByTestId('study-generated')).toHaveTextContent('false');
      //expect(getByTestId('area-trajectory')).toHaveTextContent(mockResponseGetTrajectoryFromStudy[0].trajectoryName);
    });
  });
});
