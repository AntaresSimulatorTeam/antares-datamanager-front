/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { FileInputStatus, RdsButton, RdsIconButton, RdsIconId } from 'rte-design-system-react';
import { HypothesisRowData, RowStatus, SelectOption } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { ButtonPreview } from '@/components/button/ButtonPreview.tsx';
import { Dispatch, SetStateAction } from 'react';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { ErrorMessageType } from '@/shared/types/Generic.type.ts';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';

const columnHelper = createColumnHelper<HypothesisRowData>();

const getHypothesisTableHeaders = (
  t: (value: string) => string,
  handleUpdate: (
    index: number,
    trajectoryId: number,
    status: RowStatus,
    trajectoryLabel?: string,
    errorMessage?: string,
  ) => Promise<void>,
  handleImport: (index: number) => Promise<void>,
  handlerSearch: (value?: string, index?: number) => Promise<SelectOption[] | undefined>,
  handleView: (index: number) => Promise<void>,
  error: ErrorMessageType,
  setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>,
  studyStatus: StudyStatus | undefined,
  progress: number,
  fileStatus: FileInputStatus,
  rowIndexSelected: number,
) => [
  columnHelper.accessor('hypothesis', {
    header: t('studyDetails.@hypothesis'),
    size: 50,
    cell: ({ getValue, row }) => {
      const { trajectory, status } = row.original;
      return (
        <div className="flex w-2/5 items-center gap-2">
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
    size: 300,
    cell: ({ row }) => {
      const { trajectory, status } = row.original;
      return trajectory && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full space-x-2 py-3">
          <span className="text-gray-900">{trajectory.trajectoryName}</span>
          {studyStatus != StudyStatus.GENERATED && (
            <RdsIconButton
              icon={RdsIconId.Close}
              size="small"
              onClick={() => {
                setErrorInfo({ index: row.index, message: '' });
                void handleUpdate(
                  row.index,
                  trajectory.id,
                  status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'emptyError' : 'empty',
                  '',
                );
              }}
            />
          )}
        </div>
      ) : (
        <div className="flex w-full items-center space-x-2">
          <div className="flex min-w-fit items-center">
            <SelectAndSearchableInput
              onSelect={(value: SelectOption) => {
                setErrorInfo({ index: row.index, message: '' });
                void handleUpdate(row.index, value.id, 'success', value.label);
              }}
              setSearchTerm={async (value?: string) => await handlerSearch(value, row.index)}
              defaultPlaceHolder={
                !row.getReadOnly() ? t('studyDetails.@select_area') : t('studyDetails.@select_trajectory')
              }
              isSearchable={true}
              isInputDisabled={row.getReadOnly()}
            />
          </div>
          <span>or</span>
          <RdsButton
            label={t('studyDetails.@import_file')}
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
      const { status, trajectory } = row.original;
      return progress > 0 && fileStatus === 'loading' && rowIndexSelected === row.index ? (
        <ProgressBar statusFile={fileStatus} progressValue={progress} />
      ) : (
        <CellWithStatus status={status} isDeletable={false} message={trajectory?.messages?.[0]?.content} />
      );
    },
  }),
];

export default getHypothesisTableHeaders;
