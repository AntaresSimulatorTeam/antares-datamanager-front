/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { FileInputStatus } from 'rte-design-system-react';
import { HypothesisRowData, RowStatus, SelectOption } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { ButtonPreview } from '@/components/button/ButtonPreview.tsx';
import { Dispatch, SetStateAction } from 'react';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { ErrorMessageType } from '@/shared/types/Generic.type.ts';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';

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
    cell: ({ row: { original, index, getReadOnly } }) => {
      const { trajectory, status } = original;
      return trajectory && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center gap-2">
          <LabelWithDeleteButton
            label={trajectory.trajectoryName}
            isDeletable={studyStatus !== StudyStatus.GENERATED}
            onClick={() => {
              setErrorInfo({ index, message: '' });
              void handleUpdate(
                index,
                trajectory.id,
                status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'emptyError' : 'empty',
                '',
              );
            }}
          />
        </div>
      ) : (
        <div className="flex w-full items-center justify-start gap-2">
          <SelectInputWithButton
            onSelect={(value: SelectOption) => {
              setErrorInfo({ index, message: '' });
              void handleUpdate(index, value.id, 'success', value.label);
            }}
            onSearch={async (value?: string) => await handlerSearch(value, index)}
            placeHolder={
              getReadOnly() && index === 1 && studyStatus !== StudyStatus.GENERATED
                ? t('studyDetails.@select_area')
                : t('studyDetails.@select_trajectory')
            }
            onClickButton={() => {
              setErrorInfo({ index, message: '' });
              void handleImport(index);
            }}
            isDisabled={getReadOnly()}
          />
          {error.message && index === error.index && <div className="text-error-700">{error.message}</div>}
        </div>
      );
    },
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    cell: ({ row }) => {
      const { status } = row.original;
      return progress > 0 && fileStatus === 'loading' && rowIndexSelected === row.index ? (
        <ProgressBar statusFile={fileStatus} progressValue={progress} />
      ) : (
        <CellWithStatus status={status} isDeletable={false} />
      );
    },
  }),
];

export default getHypothesisTableHeaders;
