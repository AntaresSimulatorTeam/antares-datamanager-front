/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdTagList from '@/components/common/base/StdTagList/StdTagList';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import { generateStudyRandomData } from '@/mocks/data/features/study.mock';
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
const columnHelper = createColumnHelper<StudyDTO>();
const StudyTableDisplay = () => {
  const [rows, setRows] = useState<StudyDTO[]>([]);

  const headers = [
    columnHelper.accessor('id', { header: 'id' }),
    columnHelper.accessor('study_name', { header: 'study_name' }),
    columnHelper.accessor('user_name', {
      header: 'user_name',
      cell: ({ getValue }) => (
        <StdAvatar size="s" backgroundColor="gray" fullname={getValue()} initials={getValue().substring(0, 2)} />
      ),
    }),
    columnHelper.accessor('creation_date', {
      header: 'creation_date',
      cell: ({ getValue }) => <>{getValue().toLocaleDateString('fr-FR')}</>,
    }),
    columnHelper.accessor('keywords', {
      header: 'keywords',
      minSize: 500,
      size: 500,
      cell: ({ getValue, row }) => (
        <div className="flex h-3 w-32">
          <StdTagList id={`pegase-tags-${row.id}`} tags={getValue()} />
        </div>
      ),
    }),
    columnHelper.accessor('project', { header: 'project' }),
  ];

  useEffect(() => {
    setTimeout(() => {
      const studies = generateStudyRandomData(10 ** 2);
      setRows(studies);
    }, 1000);
  }, []);
  return (
    <div className="h-60vh overflow-auto">
      <StdSimpleTable columns={headers} data={rows} />
    </div>
  );
};

export default StudyTableDisplay;
