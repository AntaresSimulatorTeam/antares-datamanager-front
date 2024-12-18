/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdTablePagination, {
  StdTablePaginationProps,
} from '@/components/common/data/stdTablePagination/StdTablePagination';

type StudiesPaginationProps = StdTablePaginationProps;

const StudiesPagination = ({ count, intervalSize, current, onChange }: StudiesPaginationProps) => {
  return (
    <div className="flex h-9 shrink-0 grow basis-0 items-center justify-end px-4 py-3">
      <StdTablePagination count={count} intervalSize={intervalSize} current={current} onChange={onChange} />
    </div>
  );
};

export default StudiesPagination;
