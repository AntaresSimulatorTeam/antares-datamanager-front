/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { RdsButton, RdsIconButton, RdsIconId } from 'rte-design-system-react';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';

const columnHelper = createColumnHelper<any>();

const getAreaLinkTableHeaders = (options, handlerSelection, handlerDelete, handleImport, handlerSearch) => {
  const { t } = useTranslation();
  return [
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
              setSearchTerm={async (value) => await handlerSearch(row.index, value)}
              defaultPlaceHolder={t('studyDetails.@placeholder')}
              isSearchable={true}
            />
            <span>or</span>
            <RdsButton label="Import" onClick={async () => await handleImport(row.index)} />
          </div>
        );
      },
    }),

    columnHelper.accessor('status', {
      header: t('home.@status'),
      cell: ({ row }) => {
        const { status } = row.original;
        if (status === 'Missing') return <span>❓ Missing</span>;
        if (status === 'OK') return <span>✔ OK</span>;
        if (status === 'Error') return <span>❌ Error</span>;
        return null;
      },
    }),
  ];
};

export default getAreaLinkTableHeaders;
