/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { HeaderConfig, StraightRow } from '../type/tableType';
import StdRowBox from './StdRowBox';

export type StdStraightRowProps<T> = {
  row: StraightRow<T>;
  headers: HeaderConfig<T>[];
  depth?: number;
  maxDepth?: number;
  renderMaxDepth?: JSX.Element;
};
const StdStraightRow = <T extends object>({ headers, row, depth = 0 }: StdStraightRowProps<T>) => (
  <tr>
    {headers.map((header, index) => (
      <td className="text-left" key={header.key}>
        <div className="flex flex-1 items-center">
          {index === 0 &&
            depth > 0 &&
            new Array(depth).map((_, indexDepth) => <StdRowBox key={`depth-${indexDepth}`} />)}
          <div className="px-1 py-0.5">
            {'formatter' in header ? header.formatter(row.data, row.key) : row.data[header.dataKey]}
          </div>
        </div>
      </td>
    ))}
  </tr>
);

export default StdStraightRow;
