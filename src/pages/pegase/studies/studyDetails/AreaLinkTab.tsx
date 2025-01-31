/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable';
import { RdsButton, RdsInputText } from 'rte-design-system-react';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';

type RowStatus = 'Missing' | 'OK' | 'Error';

type RowData = {
  hypothesis: string;
  trajectory: string | null; // Null si aucune trajectoire n'est sélectionnée
  status: RowStatus;
};

const AreaLinkTab = () => {
  const [data, setData] = useState<RowData[]>([
    { hypothesis: 'Areas', trajectory: null, status: 'Missing' },
    { hypothesis: 'Links', trajectory: null, status: 'Missing' },
  ]);
  const [readOnly, _] = useState<ReadOnlyObject>({ '0': false, '1': !data[0].trajectory });

  const handleImport = (index: number) => {
    const updatedData = [...data];
    updatedData[index].trajectory = 'BP_23_ref';
    updatedData[index].status = 'OK';
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
          <div className="flex items-center space-x-2">
            <span>{trajectory}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <RdsInputText label="" value="" placeHolder="Choose a trajectory" variant="outlined" />
            <span>or</span>
            <RdsButton label="Import" onClick={() => handleImport(index)} />
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
      <StdSimpleTable
        id="example-table"
        data={data}
        columns={columns}
        columnSize="meta"
        enableReadOnly={true}
        state={{ readOnly }}
      />
    </div>
  );
};

export default AreaLinkTab;
