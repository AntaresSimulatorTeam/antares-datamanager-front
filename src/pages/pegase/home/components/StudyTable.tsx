/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSearchInput from '@/components/common/forms/stdSearchInput/StdSearchInput';
import StudyTableDisplay from './StudyTableDisplay';
import { useState } from 'react';

interface StudyTableProps {
  selectedRow: number;
  setSelectedRow: (id: number) => void;
}

const StudyTable: React.FC<StudyTableProps> = ({ setSelectedRow, selectedRow }) => {
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const searchStudy = (value?: string | undefined) => {
    setSearchTerm(value);
  };
  return (
    <div className="flex w-full flex-col gap-3 overflow-auto p-9">
      <div className="flex w-full flex-row justify-between">
        <div>
          <StdSearchInput onSearch={searchStudy} placeHolder="Search" variant="outlined" />
        </div>
      </div>
      <StudyTableDisplay searchStudy={searchTerm} selectedRow={selectedRow} setSelectedRow={setSelectedRow} />
    </div>
  );
};

export default StudyTable;
