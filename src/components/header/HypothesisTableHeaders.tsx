/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { HypothesisRowData, SelectOption, TableHeadersGetterProps } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';
import { getAlignment } from '@/shared/utils/hypothesisTableUtils.ts';
import { LabelWithButtonPreview } from '@common/data/LabelWithButtonPreview.tsx';

const columnHelper = createColumnHelper<HypothesisRowData>();

const getHypothesisTableHeaders = ({
  t,
  errorInfo,
  setErrorInfo,
  studyState,
  progress,
  fileStatus,
  idSelected,
}: TableHeadersGetterProps) => [
  columnHelper.accessor('hypothesis', {
    header: t('studyDetails.@hypothesis'),
    size: 300,
    cell: ({ getValue, row, table: { options } }) => {
      const { trajectory, status } = row.original;
      return (
        <div className="w-1/5">
          <LabelWithButtonPreview
            value={getValue()}
            status={status}
            isReadOnly={row.getReadOnly()}
            hasPreview={!!trajectory && status === TRAJECTORY_SELECTION_STATUS.OK}
            alignment={getAlignment(row)}
            onClick={() => void options?.meta?.viewData?.(row.id)}
            disabled={row.getReadOnly()}
          />
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    size: 900,
    cell: ({ row, table: { options } }) => {
      const { trajectory, status } = row.original;
      return trajectory && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center gap-2 py-1">
          <LabelWithDeleteButton
            label={trajectory.trajectoryName}
            isDeletable={studyState !== StudyStatus.GENERATED}
            onClick={() => {
              setErrorInfo({ index: row.index, message: '' });
              void options?.meta?.updateData?.(
                row.id,
                trajectory?.trajectoryName,
                status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'emptyError' : 'empty',
              );
            }}
          />
        </div>
      ) : (
        <div className="flex w-full items-center justify-start gap-2">
          <SelectInputWithButton
            onSelect={(value: SelectOption) => {
              setErrorInfo({ index: row.index, message: '' });
              void options?.meta?.updateData?.(row.id, value.label, 'success');
            }}
            onSearch={async (value?: string) => options?.meta?.search?.(value ?? '', row.id)}
            placeHolder={
              row.getReadOnly() && row.index === 1 && studyState !== StudyStatus.GENERATED
                ? t('studyDetails.@select_area')
                : t('studyDetails.@select_trajectory')
            }
            onClickButton={() => {
              setErrorInfo({ index: row.index, message: '' });
              void options?.meta?.importData?.(row.id);
            }}
            isDisabled={row.getReadOnly()}
          />
          {errorInfo.message && row.index === errorInfo.index && (
            <div className="text-error-700">{errorInfo.message}</div>
          )}
        </div>
      );
    },
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    size: 190,
    cell: ({ row }) => {
      const { status } = row.original;
      return progress > 0 && fileStatus === 'loading' && idSelected === row.id ? (
        <ProgressBar statusFile={fileStatus} progressValue={progress} />
      ) : (
        <CellWithStatus status={status} isDeletable={false} />
      );
    },
  }),
];

export default getHypothesisTableHeaders;
