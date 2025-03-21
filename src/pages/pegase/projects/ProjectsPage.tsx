/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ProjectContent from '@/pages/pegase/projects/ProjectContent';
import { ProjectProvider } from '@/store/contexts/ProjectProvider.tsx';
import ProjectCreator from '@/pages/pegase/home/pinnedProjects/ProjectCreator.tsx';
import PinnedProjectCards from '@/pages/pegase/home/pinnedProjects/PinnedProjectCard.tsx';

const ProjectsPage = () => (
  <ProjectProvider initialValue={{ pinnedProjects: [], projects: [] }}>
    <div className="flex flex-col items-center gap-6 p-3">
      <div className="flex w-full gap-3">
        <ProjectCreator />
        <PinnedProjectCards />
      </div>
      <ProjectContent />
    </div>
  </ProjectProvider>
);

export default ProjectsPage;
