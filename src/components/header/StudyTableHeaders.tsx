/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StudyDTO } from '@/shared/types/Study.type.ts';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter.ts';
import { createColumnHelper } from '@tanstack/react-table';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { RadioButton } from '@design-system-rte/react';
import StdTagList from '@common/base/StdTagList/StdTagList.tsx';
import { StudyStatusCell } from '@common/data/StudyStatusCell.tsx';
import UserDisplayCell from '@common/layout/UserDisplayCell.tsx';

const columnHelper = createColumnHelper<StudyDTO>();

const getStudyTableHeaders = (t: (value: string) => string) => [
  columnHelper.accessor('name', {
    header: t('home.@study_name'),
    size: 300,
    cell: ({ getValue, row }) => {
      const status = row.original.status;
      const isSelected = row.getIsSelected();

      const handleToggle = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT') {
          e.preventDefault();
        }
        e.stopPropagation();

        if (row.getCanSelect()) {
          row.toggleSelected(!isSelected);
        }
      };
      return (
        <button
          className={`px-1 [&_[class*='_radioButtonContainer']]:!items-center [&_[class*='radioButtonLabel']]:!font-body [&_[class*='radioButtonLabel']]:!text-text-m ${
            isSelected
              ? "[&_[class*='radioButtonBackground']]:opacity-100"
              : "[&_[class*='radioButtonBackground']]:opacity-0 group-hover:[&_[class*='radioButtonBackground']]:opacity-100"
          }`}
          onClick={handleToggle}
          onKeyDown={() => {}}
        >
          <RadioButton
            groupName="study-table-radio-group"
            value={row.id}
            label={getValue()}
            disabled={!row.getCanSelect()}
            isChecked={isSelected}
            onChange={() => {
              if (row.getCanSelect()) {
                row.toggleSelected(!isSelected);
              }
            }}
            className={`${status === StudyStatus.GENERATED ? '!text-content-brand-default group-hover:!text-content-brand-default' : status === StudyStatus.ERROR ? '!text-content-critical group-hover:!text-content-critical' : '!text-content-primary group-hover:!text-content-primary'}`}
          />
        </button>
      );
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
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? formatDateToDDMMYYYY(value, true) : '';
    },
  }),

  columnHelper.accessor('createdBy', {
    header: t('home.@user_name'),
    size: 50,
    cell: ({ getValue }) => <div className="py-0.25"><UserDisplayCell nni={getValue() ?? 'Un'} /></div>,
  }),

  columnHelper.accessor('keywords', {
    header: t('home.@keywords'),
    size: 350,
    cell: ({ getValue }) => {
      const tagList = getValue();
      return <StdTagList maxVisibleTags={2} tags={tagList} />;
    },
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    size: 230,
    cell: ({ getValue }) => <StudyStatusCell status={getValue()} />,
  }),

  columnHelper.accessor('generationDate', {
    header: t('home.@generation_date'),
    size: 200,
    cell: ({ getValue }) => {
      const value = getValue();
      return value ? formatDateToDDMMYYYY(value, true) : '';
    },
  }),
];

export default getStudyTableHeaders;
