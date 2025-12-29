import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ProjectProvider } from '../ProjectProvider';
import { ProjectContext, ProjectDispatchContext } from '../ProjectContext';
import { useContext } from 'react';
import { projectReducer } from '@/store/reducers/projectReducer.tsx';
import { ProjectActionType, ProjectInfo, ProjectState } from '@/shared/types';
import { PROJECT_ACTION } from '@/shared/enum/project.ts';

const TestConsumer = () => {
  const { projects, pinnedProjects } = useContext(ProjectContext);
  const dispatch = useContext(ProjectDispatchContext);

  return (
    <>
      <div data-testid="projects">{JSON.stringify(projects)}</div>
      <div data-testid="pinned">{JSON.stringify(pinnedProjects)}</div>
      <button
        onClick={() => dispatch?.({ type: PROJECT_ACTION.ADD_PINNED_PROJECT } as ProjectActionType)}
        data-testid="dispatch-btn"
      >
        dispatch
      </button>
    </>
  );
};

vi.mock('@/store/reducers/projectReducer', () => ({
  projectReducer: vi.fn((state, _action) => state as ProjectState),
}));

describe('ProjectProvider', () => {
  const initialValue = {
    projects: [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ] as unknown as ProjectInfo[],
    pinnedProjects: [{ id: 2, name: 'B' }] as unknown as ProjectInfo[],
  } as ProjectState;

  it('fournit les projets filtrés dans ProjectContext', () => {
    render(
      <ProjectProvider initialValue={initialValue}>
        <TestConsumer />
      </ProjectProvider>,
    );

    const projects = JSON.parse(screen.getByTestId('projects').textContent || '[]') as ProjectInfo[];

    expect(projects).toEqual([
      { id: 1, name: 'A' },
      { id: 3, name: 'C' },
    ]);
  });

  it('fournit les pinnedProjects dans ProjectContext', () => {
    render(
      <ProjectProvider initialValue={initialValue}>
        <TestConsumer />
      </ProjectProvider>,
    );

    const pinned = JSON.parse(screen.getByTestId('pinned').textContent || '[]') as ProjectInfo[];

    expect(pinned).toEqual([{ id: 2, name: 'B' }]);
  });

  it('fournit un dispatch fonctionnel dans ProjectDispatchContext', () => {
    render(
      <ProjectProvider initialValue={initialValue}>
        <TestConsumer />
      </ProjectProvider>,
    );

    act(() => screen.getByTestId('dispatch-btn').click());

    expect(projectReducer).toHaveBeenCalledWith(initialValue, { type: PROJECT_ACTION.ADD_PINNED_PROJECT });
  });
});
