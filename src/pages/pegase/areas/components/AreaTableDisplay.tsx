/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdSimpleTable from '@/components/common/data/stdSimpleTable/StdSimpleTable';
import { generateAreaRandomData } from '@/mocks/data/features/area.mock';
import { AreaDTO } from '@/shared/types/pegase/area';
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
const columnHelper = createColumnHelper<AreaDTO>();
const AreaTableDisplay = () => {
  const [rows, setRows] = useState<AreaDTO[]>([]);

  const headers = [
    columnHelper.accessor('id', { header: 'id' }),
    columnHelper.accessor('area_hypothesis', { header: 'Area Hyphotesis' }),
    columnHelper.accessor('trajectory', { header: 'Trajectory to use' }),
    columnHelper.accessor('status', { header: 'Status' }),
  ];

  useEffect(() => {
    setTimeout(() => {
      const areas = generateAreaRandomData(10);
      setRows(areas);
    }, 10);
  }, []);

  console.log('Rows passed to StdSimpleTable:', rows);
  return (
    <div className="h-60vh overflow-auto">
      <StdSimpleTable columns={headers} data={rows} />
    </div>
  );
};

export default AreaTableDisplay;
