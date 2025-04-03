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
import { Dispatch, SetStateAction } from 'react';
import { ErrorMessageType } from '@/components/tab/AreaLinkTab.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

const columnHelper = createColumnHelper<AreaAndLinkRowData>();

const getAreaLinkTableHeaders = (
  t: (value: string) => string,
  handleUpdate: (index: number, status: RowStatus, trajectoryId: number, trajectoryLabel?: string) => Promise<void>,
  handleImport: (index: number) => Promise<void>,
  handlerSearch: (index: number, value: string | undefined) => Promise<SelectOption[] | undefined>,
  handleView: (index: number) => Promise<void>,
  error: { index: number; message: string },
  setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>,
  studyStatus: StudyStatus | undefined,
) => [
  columnHelper.accessor('hypothesis', {
    header: t('studyDetails.@hypothesis'),
    cell: ({ getValue, row }) => {
      const { trajectory, status } = row.original;
      return (
        <div className="inline-flex w-[180px] items-center gap-2">
          <span
            className={`${trajectory && status === TRAJECTORY_SELECTION_STATUS.OK ? 'text-primary-600' : 'text-gray-900'}`}
          >
            {getValue()}
          </span>
          {trajectory && status === TRAJECTORY_SELECTION_STATUS.OK && (
            <ButtonPreview
              label={'View'}
              icon={StdIconId.Preview}
              position={'left'}
              color={row.getReadOnly() ? 'gray-700' : 'primary-600'}
              borderColor={row.getReadOnly() ? 'gray-700' : 'acc1-600'}
              onClick={() => void handleView(row.index)}
            />
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    cell: ({ row }) => {
      const { trajectory, status } = row.original;
      const textClass = studyStatus === StudyStatus.GENERATED ? 'text-primary-600' : 'text-gray-900';
      return trajectory ? (
        <div className="inline-flex w-[850px] space-x-2 py-3">
          <span className={`${textClass}`}>{trajectory.trajectoryName}</span>
          {studyStatus != StudyStatus.GENERATED && (
            <RdsIconButton
              icon={RdsIconId.Delete}
              size="small"
              onClick={() => {
                setErrorInfo({ index: row.index, message: '' });
                void handleUpdate(
                  row.index,
                  status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'emptyError' : 'empty',
                  trajectory.id,
                );
              }}
            />
          )}
        </div>
      ) : (
        <div className="inline-flex w-[850px] items-center space-x-2">
          <SelectAndSearchableInput
            onSelect={(value: SelectOption) => {
              setErrorInfo({ index: row.index, message: '' });
              void handleUpdate(row.index, 'success', value.id, value.label);
            }}
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
            onClick={() => {
              setErrorInfo({ index: row.index, message: '' });
              void handleImport(row.index);
            }}
            disabled={row.getReadOnly()}
          />
          {error.message && row.index === error.index && <div className="text-error-700">{error.message}</div>}
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
            <RdsIcon name={RdsIconId.Done} color="primary-600" /> {t('studyDetails.@import_status_done')}
          </div>
        );
      if (status === TRAJECTORY_SELECTION_STATUS.ERROR)
        return (
          <div className="flex flex-1 items-end gap-1">
            <RdsIcon name={RdsIconId.Info} color="error-700" /> {t('studyDetails.@import_status_error')}
          </div>
        );
      return null;
    },
  }),
];

export default getAreaLinkTableHeaders;
