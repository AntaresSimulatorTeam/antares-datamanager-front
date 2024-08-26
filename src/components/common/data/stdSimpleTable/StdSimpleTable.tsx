/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdRenderRow from './lineRender/StdRenderRow';
import { rowClassBuilder } from './simpleTableClassBuilder';
import { HeaderConfig, RowData, StraightRow } from './type/tableType';

type StraightTableType<T> = {
  rows: StraightRow<T>[];
  collapsible?: false;
};
type CollapsibleTableType<T> = {
  rows: RowData<T>[];
  collapsible: true;
};
type CommonTableType<T> = {
  id?: string;
  headers: HeaderConfig<T>[];
  striped?: boolean;
  maxDepth?: number;
  renderMaxDepth?: JSX.Element;
};

export type StdSimpleTableProps<T> = CommonTableType<T> & (CollapsibleTableType<T> | StraightTableType<T>);

const START_COLLAPSIBLE_DEPTH = -1;
const START_NON_COLLAPSIBLE_DEPTH = -2;

const StdSimpleTable = <T extends object>({
  rows,
  headers,
  collapsible,
  maxDepth,
  renderMaxDepth,
  striped = false,
}: StdSimpleTableProps<T>) => {
  const { tableClasses, headersClasses } = rowClassBuilder(striped, headers);

  return (
    <table className={tableClasses}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th className={headersClasses[header.key]} key={header.key}>
              <span>{header.label}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <StdRenderRow
            headers={headers}
            row={row}
            depth={collapsible ? START_COLLAPSIBLE_DEPTH : START_NON_COLLAPSIBLE_DEPTH}
            maxDepth={maxDepth}
            renderMaxDepth={renderMaxDepth}
            key={row.key}
          />
        ))}
      </tbody>
    </table>
  );
};

export default StdSimpleTable;
