/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';

import SearchBar from './SearchBar';
import StudyTableDisplay from './StudyTableDisplay';

const HomePageContent = () => {
  const chipLabels = ['Chip', 'Chip', 'Chip'];
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');

  const searchStudy = (value?: string | undefined) => {
    setSearchTerm(value);
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <StdHeading title="Studies in progress" />
      <div className="flex gap-4 py-2">
        <SearchBar onSearch={searchStudy} chipLabels={chipLabels} />
      </div>
      <StudyTableDisplay searchStudy={searchTerm} />
    </div>
  );
};

export default HomePageContent;
