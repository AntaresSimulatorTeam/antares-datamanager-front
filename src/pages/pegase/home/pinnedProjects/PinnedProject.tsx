/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PinnedProjectCards from '@/pages/pegase/home/pinnedProjects/PinnedProjectCard';
import ProjectCreator from '@/pages/pegase/home/pinnedProjects/ProjectCreator';
import { Dispatch, SetStateAction } from 'react';

interface PinnedProjectProps {
  setShouldRefetchProjectList?: Dispatch<SetStateAction<boolean>>;
}

const PinnedProject = ({ setShouldRefetchProjectList }: PinnedProjectProps) => {
  return (
    <div className="flex w-full gap-3">
      <ProjectCreator />
      <PinnedProjectCards setShouldRefetchProjectList={setShouldRefetchProjectList} />
    </div>
  );
};

export default PinnedProject;
