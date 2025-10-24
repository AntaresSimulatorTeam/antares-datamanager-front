/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { HypothesisRowData, SelectOption, TableHeadersGetterProps } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithButtonPreview } from '@common/data/LabelWithButtonPreview.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

const columnHelper = createColumnHelper<HypothesisRowData>();

const getEditableHypothesisTableHeaders = ({
  t,
  errorInfo,
  setErrorInfo,
  studyState,
  progress,
  fileStatus,
  idSelected,
  columnHeader,
}: TableHeadersGetterProps) => [
  columnHelper.accessor('hypothesis', {
    header: columnHeader || t('studyDetails.@areas'),
    size: 233,
    cell: ({ getValue, row }) => {
      const { status, isDefault } = row.original;
      return (
        <LabelWithButtonPreview
          value={getValue()}
          extraValue={isDefault && getValue() !== OTHER_AREAS_LABEL ? `(${t('studyDetails.@default')})` : ''}
          status={status}
          isReadOnly={row.getReadOnly()}
          hasPreview={false}
        />
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    size: 623,
    cell: ({ row, table: { options } }) => {
      const { trajectory, status } = row.original;

      return trajectory?.trajectoryName && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center gap-2">
          <LabelWithDeleteButton
            label={trajectory.trajectoryName}
            isDeletable={!(studyState === StudyStatus.GENERATED)}
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
            onSearch={async (value?: string) => await options?.meta?.search?.(value ?? '', row.id)}
            onClickButton={async () => {
              setErrorInfo({ index: row.index, message: '' });
              await options?.meta?.importData?.(row.id);
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
    size: 233,
    cell: ({ row, table: { options } }) => {
      const { status, hypothesis, isDefault, isDeletable } = row.original;
      return progress > 0 && fileStatus === 'loading' && idSelected === row.id ? (
        <ProgressBar statusFile={fileStatus} progressValue={progress} />
      ) : (
        <CellWithStatus
          status={status}
          isDeletable={!isDefault && studyState !== StudyStatus.GENERATED && (isDeletable ?? false)}
          onClick={() => void options?.meta?.removeRow?.(hypothesis, row.id)}
        />
      );
    },
  }),
];

export default getEditableHypothesisTableHeaders;
