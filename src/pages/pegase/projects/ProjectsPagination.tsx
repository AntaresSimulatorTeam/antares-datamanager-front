/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsTablePagination, RdsTablePaginationProps } from 'rte-design-system-react';

type StudiesPaginationProps = RdsTablePaginationProps;

const ProjectsPagination = ({ count, intervalSize, current, onChange }: StudiesPaginationProps) => (
  <div className="flex h-9 flex-[1_0_0] items-center justify-end px-4 py-3">
    <RdsTablePagination count={count} intervalSize={intervalSize} current={current} onChange={onChange} />
  </div>
);

export default ProjectsPagination;
