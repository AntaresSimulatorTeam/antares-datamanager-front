/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import { StudyDTO } from '@/shared/types/Study.type.ts';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { createColumnHelper } from '@tanstack/react-table';
import { RdsTagList } from 'rte-design-system-react';
import StdRadioButton from '@/components/forms/stdRadioButton/StdRadioButton.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { getStatusIcon } from '@/shared/utils/iconUtils.ts';
import { sentenceCase } from '@/shared/utils/textUtils.ts';

const columnHelper = createColumnHelper<StudyDTO>();

const getStudyTableHeaders = (t: (value: string) => string) => [
  columnHelper.display({
    id: 'radioColumn',
    header: '',
    size: 50,
    cell: ({ row }) => (
      <div className={`${row.getIsSelected() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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

  columnHelper.accessor('name', {
    header: t('home.@study_name'),
    size: 300,
    cell: ({ getValue, row }) => {
      const status = row.original.status;
      const textClass = status === StudyStatus.GENERATED ? 'text-primary-600' : 'group-hover:text-green-500';
      return <span className={`transition-colors ${textClass}`}>{getValue()}</span>;
    },
  }),

  columnHelper.accessor('project', {
    header: t('home.@project'),
    size: 300,
  }),

  columnHelper.accessor('horizon', {
    header: t('home.@horizon'),
    size: 100,
  }),

  columnHelper.accessor('creationDate', {
    header: t('home.@creation_date'),
    size: 200,
    cell: ({ getValue }) => formatDateToDDMMYYYY(getValue(), true),
  }),

  columnHelper.accessor('createdBy', {
    header: t('home.@user_name'),
    size: 50,
    cell: ({ getValue }) => (
      <StdAvatar
        size="es"
        backgroundColor="gray"
        fullname={getValue() ?? ''}
        initials={getValue()?.substring(0, 2) ?? ''}
      />
    ),
  }),

  columnHelper.accessor('keywords', {
    header: t('home.@keywords'),
    size: 350,
    cell: ({ getValue, row }) => (
      <div className="flex h-3">
        <RdsTagList id={`pegase-tags-${row.id}`} tags={getValue()} />
      </div>
    ),
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    size: 230,
    cell: ({ getValue }) => {
      const status = getValue();
      const { icon, color } = getStatusIcon(status);
      return (
        <div className="flex gap-1">
          <StdIcon name={icon} color={`text-${color}`} />
          <div>{sentenceCase(status)}</div>
        </div>
      );
    },
  }),
];

export default getStudyTableHeaders;
