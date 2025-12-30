import { ProjectState } from '@/shared/types';

export const selectFilteredProjects = (state: ProjectState) =>
  state?.projects?.filter((project) => !state?.pinnedProjects?.some((p) => p.id === project.id));
