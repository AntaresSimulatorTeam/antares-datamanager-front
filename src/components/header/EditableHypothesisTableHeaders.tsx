/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { FileInputStatus, HypothesisRowData, SelectOption } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { Dispatch, SetStateAction } from 'react';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithButtonPreview } from '@common/data/LabelWithButtonPreview.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';
import { ErrorMessageType } from '@/shared/types/Generic.type.ts';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';

const columnHelper = createColumnHelper<HypothesisRowData>();

const getEditableHypothesisTableHeaders = (
  t: (value: string) => string,
  error: ErrorMessageType,
  setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>,
  studyStatus: StudyStatus | undefined,
  progress: number,
  fileStatus: FileInputStatus,
  idSelected: string,
  columnHeader?: string,
) => [
  columnHelper.accessor('hypothesis', {
    header: columnHeader || t('studyDetails.@area'),
    size: 130,
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
    size: 380,
    cell: ({ row, table: { options } }) => {
      const { trajectory, status } = row.original;

      return trajectory?.trajectoryName && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center gap-2">
          <LabelWithDeleteButton
            label={trajectory.trajectoryName}
            isDeletable={!(studyStatus === StudyStatus.GENERATED)}
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
          {error.message && row.index === error.index && <div className="text-error-700">{error.message}</div>}
        </div>
      );
    },
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    cell: ({ row, table: { options } }) => {
      const { status, hypothesis, isDefault, isDeletable } = row.original;
      return progress > 0 && fileStatus === 'loading' && idSelected === row.id ? (
        <ProgressBar statusFile={fileStatus} progressValue={progress} />
      ) : (
        <CellWithStatus
          status={status}
          isDeletable={!isDefault && studyStatus !== StudyStatus.GENERATED && (isDeletable ?? false)}
          onClick={() => void options?.meta?.removeRow?.(hypothesis, row.id)}
        />
      );
    },
  }),
];

export default getEditableHypothesisTableHeaders;
