/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSearchInput from '@/components/common/forms/stdSearchInput/StdSearchInput';
import StudyTableDisplay from './StudyTableDisplay';

const StudyTable = () => {
  const searchStudy = (value?: string) => {
    console.log(value);
  };

  return (
    <div className="flex w-full flex-col gap-3 overflow-auto p-9">
      <div className="flex w-full flex-row justify-between">
        <div>
          <StdSearchInput onSearch={searchStudy} placeHolder="Search" variant="outlined" />
        </div>
      </div>
      <StudyTableDisplay />
    </div>
  );
};

export default StudyTable;
