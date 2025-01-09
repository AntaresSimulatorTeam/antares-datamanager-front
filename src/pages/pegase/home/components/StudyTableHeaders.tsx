/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import { StudyDTO } from '@/shared/types/pegase/study';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { RdsRadioButton, RdsTagList } from 'rte-design-system-react';

const columnHelper = createColumnHelper<StudyDTO>();

const getStudyTableHeaders = () => {
  const { t } = useTranslation();
  return [
    columnHelper.display({
      id: 'radioColumn',
      header: () => <></>,
      cell: ({ row }) => (
        <div className={`${row.getIsSelected() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <RdsRadioButton
            value={row.original.id.toString()}
            label=""
            disabled={!row.getCanSelect()}
            checked={row.getIsSelected()}
            name={`radio-${row.original.id}`}
          />
        </div>
      ),
    }),

    columnHelper.accessor('name', {
      header: t('home.@study_name'),
      cell: ({ getValue, row }) => {
        const status = row.original.status;
        const textClass = status === StudyStatus.GENERATED ? 'text-primary-900' : 'group-hover:text-green-500';
        return <span className={`transition-colors ${textClass}`}>{getValue()}</span>;
      },
    }),

    columnHelper.accessor('createdBy', {
      header: t('home.@user_name'),
      cell: ({ getValue }) => (
        <StdAvatar size="es" backgroundColor="gray" fullname={getValue()} initials={getValue().substring(0, 2)} />
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
      header: t('home.@keywords'),
      minSize: 500,
      size: 500,
      cell: ({ getValue, row }) => (
        <div className="flex h-3 w-32">
          <RdsTagList id={`pegase-tags-${row.id}`} tags={getValue()} />
        </div>
      ),
    }),

    columnHelper.accessor('creationDate', {
      header: t('home.@creation_date'),
    }),
  ];
};

export default getStudyTableHeaders;
