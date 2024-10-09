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

const AreaLine = ({ area, updateArea }: { area: AreaDTO; updateArea: (area: AreaDTO) => void }) => {
  const [hypothesis, setHypothesis] = useState<string>(area.areaHypothesis);
  const [trajectory, setTrajectory] = useState<string>(area.trajectory);

  const handleInputBlur = () => {
    updateArea({ id: area.id, areaHypothesis: hypothesis, trajectory });
  };
  return (
    <div className="flex space-x-4">
      <StdInputText
        id={`areas-hypothesis-input-${area.id}`}
        label={`Load Hypothesis`}
        value={hypothesis}
        onChange={setHypothesis}
      />
      <StdInputText
        id={`areas-trajectory-input-${area.id}`}
        label={`Trajectory to use`}
        value={trajectory}
        onBlur={handleInputBlur}
        onChange={setTrajectory}
      />
    </div>
  );
};

const AreaTableDisplay = () => {
  const [rows, setRows] = useState<AreaDTO[]>([]);

  // const headers = [
  //   columnHelper.accessor('id', { header: 'id' }),
  //   columnHelper.accessor('area_hypothesis', { header: 'Area Hyphotesis' }),
  //   columnHelper.accessor('trajectory', { header: 'Trajectory to use' }),
  // ];

  useEffect(() => {
    setTimeout(() => {
      const areas = generateAreaRandomData(5);
      setRows(areas);
    }, 5);
  }, []);

  const handleAreaChange = (area: AreaDTO) => {
    setRows((prev) => {
      const newRows = [...prev];
      newRows[0] = area;
      return newRows;
    });
  };
  return (
    <div className="h-60vh overflow-auto">
      <div className="space-y-4">
        {rows.map((row) => (
          <AreaLine key={row.id} area={row} updateArea={handleAreaChange} />
        ))}
      </div>
    </div>
  );
};

export default AreaTableDisplay;
