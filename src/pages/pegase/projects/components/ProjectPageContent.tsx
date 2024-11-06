/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import SearchBar from '../../home/components/SearchBar';
import PinnedProjectsCard from './PinnedProjectsCard';
import ProjectCardsGrid from './ProjectCardsGrid';

export const ProjectPageContent = () => {
  const chipLabels = ['Chip', 'Chip', 'Chip', 'Chip'];
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');

  const searchStudy = (value?: string | undefined) => {
    setSearchTerm(value);
  };
  return (
    <div className="flex flex-col gap-6 p-3">
      <PinnedProjectsCard />
      <div className="flex gap-4 py-2">
        <SearchBar onSearch={searchStudy} chipLabels={chipLabels} />
      </div>
      <ProjectCardsGrid />
    </div>
  );
};

export default ProjectPageContent;
