/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdTagList from '@/components/common/base/StdTagList/StdTagList';
import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { HeaderConfig, StraightRow } from '@/components/common/data/stdSimpleTable/type/tableType';
import { generateStudyRandomData } from '@/mocks/data/features/study.mock';
import { useEffect, useState } from 'react';

const StudyTableDisplay = () => {
  const [rows, setRows] = useState<StraightRow<StudyDTO>[]>([]);

  const headers: HeaderConfig<StudyDTO>[] = [
    { label: 'id', key: 'id', dataKey: 'id' },
    { label: 'study_name', key: 'study_name', dataKey: 'study_name' },
    { label: 'user_name', key: 'user_name', dataKey: 'user_name' },
    {
      label: 'creation_date',
      key: 'creation_date',
      formatter: (row) => <>{row.creation_date.toLocaleDateString('fr-FR')}</>,
    },
    {
      label: 'keywords',
      key: 'keywords',
      formatter: (row, key) => (
        <div className="h-3 w-32">
          <StdTagList id={`pegase-tags-${key}`} tags={row.keywords} />
        </div>
      ),
    },
    { label: 'project', key: 'project', dataKey: 'project' },
  ];

  useEffect(() => {
    setTimeout(() => {
      const studies = generateStudyRandomData(10);

      setRows(studies.map((study) => ({ key: study.study_name, data: study })));
    }, 1000);
  }, []);
  return (
    <div>
      <StdSimpleTable headers={headers} rows={rows} collapsible={false} />
    </div>
  );
};

export default StudyTableDisplay;
