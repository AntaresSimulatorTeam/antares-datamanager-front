/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { HypothesisRowData, SelectOption, TableHeadersGetterProps } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithButtonPreview } from '@common/data/LabelWithButtonPreview.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { RdsIconButton, RdsIconId } from 'rte-design-system-react';

const columnHelper = createColumnHelper<HypothesisRowData>();

const getEditableHypothesisTableHeaders = ({
  t,
  errorInfo,
  setErrorInfo,
  isStudyGenerated,
  progress,
  fileStatus,
  idSelected,
  columnHeader,
}: TableHeadersGetterProps) => [
  columnHelper.accessor('hypothesis', {
    header: columnHeader || t('studyDetails.@areas'),
    size: 233,
    cell: ({ getValue, row, table: { options } }) => {
      const { trajectory, status, isDefault } = row.original;
      return (
        <div className="w-2/5">
          <LabelWithButtonPreview
            value={getValue()}
            extraValue={isDefault && getValue() !== OTHER_AREAS_LABEL ? `(${t('studyDetails.@default')})` : ''}
            status={status}
            isReadOnly={row.getReadOnly()}
            hasPreview={!!options?.meta?.viewData && !!trajectory && status === TRAJECTORY_SELECTION_STATUS.OK}
            onClick={() => void options?.meta?.viewData?.(row.id)}
          />
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    size: 623,
    cell: ({ row, table }) => {
      const { trajectory, status } = row.original;

      return trajectory?.trajectoryName && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center gap-2 py-1">
          <LabelWithDeleteButton
            label={trajectory.trajectoryName}
            isDeletable={!isStudyGenerated}
            onClick={() => {
              setErrorInfo({ index: row.index, message: '' });
              void table.options?.meta?.updateData?.(
                row.id,
                trajectory?.id,
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
              void table.options?.meta?.updateData?.(row.id, value.id, 'success');
            }}
            onSearch={async (value?: string) => await table.options?.meta?.search?.(value ?? '', row.id)}
            onClickButton={async () => {
              setErrorInfo({ index: row.index, message: '' });
              await table.options?.meta?.importData?.(row.id);
            }}
            isDisabled={row.getReadOnly()}
            placeHolder={
              table.getSortedRowModel().rows?.[0]?.original?.status === TRAJECTORY_SELECTION_STATUS.MISSING &&
              table.getSortedRowModel().rows?.[0]?.original?.trajectory?.type === TRAJECTORY_TYPE.AREA &&
              row.index === 1 &&
              !isStudyGenerated
                ? t('studyDetails.@select_area')
                : t('studyDetails.@select_trajectory')
            }
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
        <div className="flex items-center gap-1">
          <CellWithStatus status={status} />
          {options?.meta?.removeRow && !isDefault && !isStudyGenerated && (
            <div className={`${isDeletable ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}>
              <RdsIconButton
                icon={RdsIconId.Delete}
                size="small"
                onClick={() => void options?.meta?.removeRow?.(hypothesis, row.id)}
              />
            </div>
          )}
        </div>
      );
    },
  }),
];

export default getEditableHypothesisTableHeaders;
