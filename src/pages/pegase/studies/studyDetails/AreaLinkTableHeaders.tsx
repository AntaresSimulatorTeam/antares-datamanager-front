/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { RdsButton, RdsIcon, RdsIconButton, RdsIconId } from 'rte-design-system-react';
import { AreaAndLinkRowData, RowStatus, SelectOption } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { ButtonPreview } from '@/components/button/ButtonPreview.tsx';

const columnHelper = createColumnHelper<AreaAndLinkRowData>();

const getAreaLinkTableHeaders = (
  options: SelectOption[][] | undefined,
  t: (value: string) => string,
  handleUpdate: (index: number, status: RowStatus, trajectory?: SelectOption) => Promise<void>,
  handleImport: (index: number) => Promise<void>,
  handlerSearch: (index: number, value: string | undefined) => Promise<SelectOption[] | undefined>,
) => [
  columnHelper.accessor('hypothesis', {
    header: t('studyDetails.@hypothesis'),
    cell: ({ getValue, row }) => {
      const { trajectory } = row.original;
      return (
        <div className="inline-flex w-[180px] items-center gap-2">
          {getValue()}
          {trajectory ? <ButtonPreview label={'View'} icon={StdIconId.Preview} position={'left'} /> : null}
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    cell: ({ row }) => {
      const { trajectory } = row.original;
      return trajectory ? (
        <div className="inline-flex w-[850px] space-x-2 py-3">
          <span>{trajectory.trajectoryName}</span>
          <RdsIconButton icon={RdsIconId.Delete} size="small" onClick={() => void handleUpdate(row.index, 'empty')} />
        </div>
      ) : (
        <div className="inline-flex w-[850px] items-center space-x-2">
          <SelectAndSearchableInput
            options={options?.[row.index] ?? []}
            onSelect={(value: SelectOption) => void handleUpdate(row.index, 'success', value)}
            setSearchTerm={async (value: string | undefined) => await handlerSearch(row.index, value)}
            defaultPlaceHolder={
              row.getReadOnly() ? t('studyDetails.@select_link') : t('studyDetails.@select_trajectory')
            }
            isSearchable={true}
            isInputDisabled={row.getReadOnly()}
          />
          <span>or</span>
          <RdsButton
            label={t('studyDetails.@select_file')}
            onClick={() => void handleImport(row.index)}
            disabled={row.getReadOnly()}
          />
        </div>
      );
    },
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    cell: ({ row }) => {
      const { status } = row.original;
      if (status === TRAJECTORY_SELECTION_STATUS.MISSING)
        return (
          <div className="flex flex-1 items-end gap-1">
            <StdIcon name={StdIconId.QuestionMark} color="text-warning-500" />{' '}
            {t('studyDetails.@import_status_missing')}
          </div>
        );
      if (status === TRAJECTORY_SELECTION_STATUS.OK)
        return (
          <div className="flex flex-1 items-end gap-1">
            <RdsIcon name={RdsIconId.Done} color="secondary" /> {t('studyDetails.@import_status_done')}
          </div>
        );
      if (status === TRAJECTORY_SELECTION_STATUS.ERROR)
        return (
          <div className="flex flex-1 items-end gap-1">
            <RdsIcon name={RdsIconId.Info} color="primary-error" /> {t('studyDetails.@import_status_error')}
          </div>
        );
      return null;
    },
  }),
];

export default getAreaLinkTableHeaders;
