/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StudyDTO } from '@/shared/types/Study.type.ts';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { createColumnHelper } from '@tanstack/react-table';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { sentenceCase } from '@/shared/utils/textUtils.ts';
import { Icon, RadioButton } from '@design-system-rte/react';
import StdTagList from '@common/base/StdTagList/StdTagList.tsx';
import UserDisplayCell from '@/components/common/layout/UserDisplayCell';

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
        <div
          className={`[&_[class*='radioButtonLabel']]:![font-size:inherit] [&_[class*='radioButtonLabel']]:![font-family:inherit] ${
            isSelected
              ? "[&_[class*='radioButtonBackground']]:opacity-100"
              : "[&_[class*='radioButtonBackground']]:opacity-0 group-hover:[&_[class*='radioButtonBackground']]:opacity-100"
          }`}
          onClick={handleToggle}
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
            className={`transition-colors ![font-size:inherit] ![font-family:inherit] ${status === StudyStatus.GENERATED ? '!text-primary-600 group-hover:!text-primary-600' : '!text-gray-800 group-hover:!text-gray-800'}`}
          />
        </div>
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
    cell: ({ getValue }) => {
      const status = getValue();
      // TODO : use inconUtils method when iconName type will be importable
      switch (status) {
        case StudyStatus.GENERATED:
          return (
            <div className="flex gap-2">
              <Icon name="download-done" color="#0e6d40" />
              <span> {sentenceCase(status)} </span>
            </div>
          );
        case StudyStatus.ERROR:
          return (
            <div className="flex gap-2">
              <Icon name="information" color="#bd0536" />
              <span> {sentenceCase(status)} </span>
            </div>
          );
        case StudyStatus.IN_PROGRESS:
        default:
          return (
            <div className="flex gap-2">
              <Icon name="trending-up" color="#123fbb" />
              <span> {sentenceCase(status)} </span>
            </div>
          );
      }
    },
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
