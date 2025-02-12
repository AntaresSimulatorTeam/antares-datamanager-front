/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { RdsButton, RdsIconButton, RdsIconId } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { AreaAndLinkRowData } from '@/shared/types/Trajectory.type.ts';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';

const columnHelper = createColumnHelper<AreaAndLinkRowData>();

const getAreaLinkTableHeaders = (
  options: SelectOption[][] | undefined,
  t: (value: string) => string,
  handlerSelection: (index: number, trajectory: SelectOption) => void,
  handlerDelete: (index: number) => void,
  handleImport: (index: number) => Promise<void>,
  handlerSearch: (index: number, value: string | undefined) => Promise<SelectOption[] | undefined>,
) => [
  columnHelper.accessor('hypothesis', {
    header: t('studyDetails.@hypothesis'),
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    cell: ({ row }) => {
      const { trajectory } = row.original;
      return trajectory ? (
        <div className="flex w-1/3 flex-none items-center justify-between space-x-2 py-3">
          <span>{trajectory}</span>
          <RdsIconButton icon={RdsIconId.Delete} size="small" onClick={() => handlerDelete(row.index)} />
        </div>
      ) : (
        <div className="flex w-1/3 flex-none items-center space-x-2">
          <SelectAndSearchableInput
            options={options?.[row.index] ?? []}
            onSelect={(value: SelectOption) => handlerSelection(row.index, value)}
            setSearchTerm={async (value: string | undefined) => await handlerSearch(row.index, value)}
            defaultPlaceHolder={row.index === 0 ? t('studyDetails.@select_trajectory') : t('studyDetails.@select_link')}
            isSearchable={true}
          />
          <span>or</span>
          <RdsButton label={t('studyDetails.@select_file')} onClick={() => void handleImport(row.index)} />
        </div>
      );
    },
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    cell: ({ row }) => {
      const { status } = row.original;
      if (status === TRAJECTORY_SELECTION_STATUS.MISSING) return <span>❓ Missing</span>;
      if (status === TRAJECTORY_SELECTION_STATUS.OK) return <span>✔ OK</span>;
      if (status === TRAJECTORY_SELECTION_STATUS.ERROR) return <span>❌ Error</span>;
      return null;
    },
  }),
];

export default getAreaLinkTableHeaders;
