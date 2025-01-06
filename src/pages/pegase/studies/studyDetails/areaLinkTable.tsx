/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import StdButton from '@common/base/stdButton/StdButton';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIconButton from '@common/base/stdIconButton/StdIconButton';

type RowStatus = 'Missing' | 'OK' | 'Error';

type RowData = {
  hypothesis: string;
  trajectory: string | null; // Null si aucune trajectoire n'est sélectionnée
  status: RowStatus;
};

const AreaLinkTable = () => {
  const [data, setData] = useState<RowData[]>([
    { hypothesis: 'Areas', trajectory: null, status: 'Missing' },
    { hypothesis: 'Links', trajectory: null, status: 'Missing' },
  ]);

  const handleImport = (index: number) => {
    const updatedData = [...data];
    updatedData[index].trajectory = 'BP_23_ref';
    updatedData[index].status = 'OK';
    setData(updatedData);
  };

  const handleDelete = (index: number) => {
    const updatedData = [...data];
    updatedData[index].trajectory = null;
    updatedData[index].status = 'Missing';
    setData(updatedData);
  };

  const columns: ColumnDef<RowData>[] = [
    {
      header: 'Hypothesis',
      accessorKey: 'hypothesis',
    },
    {
      header: 'Trajectory to use',
      cell: ({ row }) => {
        const index = row.index;
        const { trajectory } = row.original;
        return trajectory ? (
          <div>
            <span>{trajectory}</span>
            <StdIconButton icon={StdIconId.Delete} onClick={() => handleDelete(index)} />
          </div>
        ) : (
          <div>
            <select>
              <option>Select a variable</option>
              <option>BP_23_ref</option>
              <option>BP_24_ref</option>
            </select>
            or
            <StdButton label="Import" onClick={() => handleImport(index)} size="meduim" />
          </div>
        );
      },
    },
    {
      header: 'Status',
      cell: ({ row }) => {
        const { status } = row.original;
        if (status === 'Missing') return <span>❓ Missing</span>;
        if (status === 'OK') return <span>✔ OK</span>;
        if (status === 'Error') return <span>❌ Error</span>;
        return null;
      },
    },
  ];

  return (
    <div className="flex-1">
      <StdSimpleTable id="example-table" data={data} columns={columns} columnSize="meta" />
    </div>
  );
};

export default AreaLinkTable;
