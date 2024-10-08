/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdInputText from '@/components/common/forms/stdInputText/StdInputText';
import { generateAreaRandomData } from '@/mocks/data/features/area.mock';
import { AreaDTO } from '@/shared/types/pegase/area';
import { createColumnHelper } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
const columnHelper = createColumnHelper<AreaDTO>();
const AreaTableDisplay = () => {
  const [rows, setRows] = useState<AreaDTO[]>([]);
  const [inputValuesLoad, setInputLoadValues] = useState<string[]>([]);

  const headers = [
    columnHelper.accessor('id', { header: 'id' }),
    columnHelper.accessor('area_hypothesis', { header: 'Area Hyphotesis' }),
    columnHelper.accessor('trajectory', { header: 'Trajectory to use' }),
  ];

  useEffect(() => {
    setTimeout(() => {
      const areas = generateAreaRandomData(5);
      setRows(areas);
    }, 5);
  }, []);

  return (
    <div className="h-60vh overflow-auto">
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="flex space-x-4">
            <StdInputText
              id={'id-input*load'}
              label={`Load Hypothesis`}
              value={inputValuesLoad[index]}
              onChange={(e) => setInputLoadValues(e.target.value)}
            />
            <StdInputText label={`Trajectory to use`} value={row.trajectory} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AreaTableDisplay;
