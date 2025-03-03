/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type';
import { StudyDTO } from '@/shared/types/Study.type.ts';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { createColumnHelper } from '@tanstack/react-table';
import { RdsRadioButton, RdsTagList } from 'rte-design-system-react';

const columnHelper = createColumnHelper<StudyDTO>();

const getStudyTableHeaders = (t: (value: string) => string) => [
  columnHelper.display({
    id: 'radioColumn',
    header: '',
    size: 50,
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
    size: 300,
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
    size: 200,
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
  }),

  columnHelper.accessor('horizon', {
    header: t('home.@horizon'),
  }),

  columnHelper.accessor('keywords', {
    header: t('home.@keywords'),
    size: 300,
    cell: ({ getValue, row }) => {
      const tags = getValue();
      return (
        tags.length > 0 && (
          <div className="min-w-96 flex h-3">
            <RdsTagList id={`pegase-tags-${row.id}`} tags={tags} />
          </div>
        )
      );
    },
  }),

  columnHelper.accessor('creationDate', {
    header: t('home.@creation_date'),
    cell: ({ getValue }) => formatDateToDDMMYYYY(getValue(), true),
  }),
];

export default getStudyTableHeaders;
