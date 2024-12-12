/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdTagList from '@/components/common/base/StdTagList/StdTagList';
import StdRadioButton from '@/components/common/forms/stdRadioButton/StdRadioButton';
import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import { StudyDTO } from '@/shared/types/pegase/study';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<StudyDTO>();

const getStudyTableHeaders = () => {
  const { t } = useTranslation();

  return [
    columnHelper.display({
      id: 'radioColumn',
      header: ({ table }) => (
        <StdRadioButton
          value="headerRadio"
          label="Select All"
          checked={table.getIsAllRowsSelected()}
          onChange={() => table.toggleAllRowsSelected()}
          name="headerRadio"
        />
      ),
      cell: ({ row }) => (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`${row.getIsSelected() ? 'block' : 'hidden group-hover:block'}`}
        >
          <StdRadioButton
            value={row.original.id.toString()}
            label=""
            disabled={!row.getCanSelect()}
            checked={row.getIsSelected()}
            name={`radio-${row.original.id}`}
          />
        </div>
      ),
    }),

    columnHelper.accessor('study_name', {
      header: t('home.@study_name'),
      cell: ({ getValue, row }) => {
        const status = row.original.status;
        const textClass = status === 'GENERATED' ? 'text-primary-900' : 'group-hover:text-green-500';
        return <span className={`transition-colors ${textClass}`}>{getValue()}</span>;
      },
    }),

    columnHelper.accessor('user_name', {
      header: t('home.@user_name'),
      cell: ({ getValue }) => (
        <StdAvatar size="s" backgroundColor="gray" fullname={getValue()} initials={getValue().substring(0, 2)} />
      ),
    }),

    columnHelper.accessor('project', {
      header: t('home.@project'),
    }),

    columnHelper.accessor('status', {
      header: t('home.@status'),
    }),

    columnHelper.accessor('horizon', {
      header: t('home.@horizon'),
    }),

    columnHelper.accessor('keywords', {
      header: 'keywords',
      minSize: 500,
      size: 500,
      cell: ({ getValue, row }) => (
        <div className="flex h-3 w-32">
          <StdTagList id={`pegase-tags-${row.id}`} tags={getValue()} />
        </div>
      ),
    }),

    columnHelper.accessor('creation_date', {
      header: t('home.@creation_date'),
    }),
  ];
};

export default getStudyTableHeaders;
