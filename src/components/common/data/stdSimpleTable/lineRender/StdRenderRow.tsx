/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RowData } from '../type/tableType';
import StdCollapseRow, { StdCollapseRowProps } from './StdCollapseRow';
import StdStraightRow, { StdStraightRowProps } from './StdStraightRow';

type StdRenderProps<T extends object> = { row: RowData<T>; key: string } & (
  | Omit<StdCollapseRowProps<T>, 'row'>
  | Omit<StdStraightRowProps<T>, 'row'>
);
const COLLAPSE_INDENT = 1;
const STRAIGHT_INDENT = 2;

const StdRenderRow = <T extends object>({ row, depth = 0, headers, maxDepth, renderMaxDepth }: StdRenderProps<T>) => {
  if (!row.collapsible) {
    return <StdStraightRow headers={headers} row={row} depth={depth + STRAIGHT_INDENT} />;
  }
  return (
    <StdCollapseRow
      headers={headers}
      row={row}
      depth={depth + COLLAPSE_INDENT}
      maxDepth={maxDepth}
      renderMaxDepth={renderMaxDepth}
    />
  );
};

export default StdRenderRow;
