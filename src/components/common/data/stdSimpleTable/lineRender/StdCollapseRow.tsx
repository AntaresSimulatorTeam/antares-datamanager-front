/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { CollapsibleRow, HeaderConfig } from '../type/tableType';
import StdCollapseIcon from './StdCollapseIcon';
import StdRenderRow from './StdRenderRow';
import StdRowBox from './StdRowBox';

export type StdCollapseRowProps<T> = {
  row: CollapsibleRow<T>;
  headers: HeaderConfig<T>[];
  depth?: number;
  maxDepth?: number;
  renderMaxDepth?: JSX.Element;
};

const StdCollapseRow = <T extends object>({
  headers,
  row,
  depth = 0,
  maxDepth,
  renderMaxDepth,
}: StdCollapseRowProps<T>) => {
  const [isOpen, setIsOpen] = useState<boolean>(!!row.defaultOpen);

  const renderMaxDepthComponent = depth + 1 > (maxDepth ?? depth + 1);

  return (
    <>
      <tr>
        {headers.map((header, index) => (
          <td className="text-left" key={header.key}>
            <div className="flex flex-1 items-center">
              {index === 0 && (
                <>
                  {depth > 0 && new Array(depth).map((_, indexDepth) => <StdRowBox key={`depth-${indexDepth}`} />)}
                  <StdCollapseIcon isOpen={isOpen} onClick={() => setIsOpen((oldValue) => !oldValue)} />
                </>
              )}
              <div className="px-1 py-0.5">
                {'formatter' in header ? header.formatter(row.data, row.key) : row.data[header.dataKey]}
              </div>
            </div>
          </td>
        ))}
      </tr>

      {isOpen &&
        (!renderMaxDepthComponent ? (
          row.childRows.map((childRow) => (
            <StdRenderRow
              row={childRow}
              depth={depth}
              headers={headers}
              maxDepth={maxDepth}
              renderMaxDepth={renderMaxDepth}
              key={childRow.key}
            />
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} className="px-1 py-0.5 text-center">
              {renderMaxDepth}
            </td>
          </tr>
        ))}
    </>
  );
};

export default StdCollapseRow;
