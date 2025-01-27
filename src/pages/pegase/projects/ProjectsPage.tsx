/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PinnedProject from '@/pages/pegase/home/pinnedProjects/PinnedProject';
import ProjectContent from '@/pages/pegase/projects/ProjectContent';
import { PinnedProjectProvider } from '@/store/contexts/ProjectContext.tsx';
import { useState } from 'react';

const ProjectsPage = () => {
  const [shouldRefetchProjectList, setShouldRefetchProjectList] = useState(false);
  return (
    <PinnedProjectProvider initialValue={{ pinnedProjects: [] }}>
      <div className="flex flex-col items-center gap-6 p-3">
        <PinnedProject setShouldRefetchProjectList={setShouldRefetchProjectList} />
        <ProjectContent shouldRefetchProjectList={shouldRefetchProjectList} />
      </div>
    </PinnedProjectProvider>
  );
};

export default ProjectsPage;
