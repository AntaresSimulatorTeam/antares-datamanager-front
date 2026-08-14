/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { HypothesisRowData, TableHeadersGetterProps } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithButtonPreview } from '@common/data/LabelWithButtonPreview.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';
import { ProgressBar } from '@/components/input/ProgressBar.tsx';
import { OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { IconButton, Switch } from '@design-system-rte/react';
import { ChangeEvent } from 'react';
import { DropdownItemProps } from '@design-system-rte/core/components/dropdown/dropdown.interface';

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
  type,
}: TableHeadersGetterProps) => [
  columnHelper.accessor('hypothesis', {
    header: columnHeader || t('studyDetails.@areas'),
    size: 233,
    cell: ({ getValue, row, table: { options } }) => {
      const { trajectory, status, isDefault } = row.original;
      return (
        <div className="w-4/5">
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
    size: type === TRAJECTORY_TYPE.STS ? 520 : 623,
    cell: ({ row, table }) => {
      const { trajectory, status } = row.original;

      return trajectory?.trajectoryName && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center justify-start gap-2 py-1">
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
        <div className="flex w-full items-center justify-start gap-2 py-0.5">
          <SelectInputWithButton
            onSelect={(value: DropdownItemProps & { id?: number }) => {
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

  ...(type === TRAJECTORY_TYPE.AREA
    ? [
        columnHelper.accessor('hvdc', {
          header: '',
          size: 220,
          cell: ({ row, table: { options } }) => {
            if (row.index === 0 || row.original.hvdc == undefined) return null;
            const {hvdc, trajectory, status} = row.original;
            return (
              <Switch
                appearance="brand"
                label={t('link.@toggle_hvdc')}
                onChange={(event: ChangeEvent<HTMLInputElement>) => void options?.meta?.activate?.(event.target.checked)}
                defaultChecked={hvdc}
                showIcon
                showLabel
                disabled={
                  status === TRAJECTORY_SELECTION_STATUS.ERROR ||
                  isStudyGenerated ||
                  (!trajectory?.trajectoryName && status === TRAJECTORY_SELECTION_STATUS.MISSING)
                }
                readOnly={isStudyGenerated}
              />
            );
          },
        }),
      ]
    : []),

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
              <IconButton name="close" size="s" onClick={() => void options?.meta?.removeRow?.(hypothesis, row.id)} />
            </div>
          )}
        </div>
      );
    },
  }),
];

export default getEditableHypothesisTableHeaders;
