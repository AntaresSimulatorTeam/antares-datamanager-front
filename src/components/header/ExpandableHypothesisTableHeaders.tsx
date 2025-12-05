/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper, TableOptions } from '@tanstack/react-table';
import { HypothesisRowData, SelectOption, TableHeadersGetterProps } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithButtonPreview } from '@common/data/LabelWithButtonPreview.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { RdsTextTooltip } from 'rte-design-system-react';
import { getAlignment, hasLabelDefault } from '@/shared/utils/hypothesisTableUtils.ts';
import StdButton from '@common/base/stdButton/StdButton.tsx';
import { getChildrenListWithArea } from '@/shared/utils/trajectoryUtils.ts';
import StdIconButton from '@common/base/stdIconButton/StdIconButton.tsx';

const columnHelper = createColumnHelper<HypothesisRowData>();
const getExpandableHypothesisTableHeaders = ({
  t,
  errorInfo,
  setErrorInfo,
  studyState,
  progress,
  fileStatus,
  idSelected,
  columnHeader,
  type,
}: TableHeadersGetterProps): TableOptions<HypothesisRowData>['columns'] => [
  columnHelper.accessor('hypothesis', {
    header: columnHeader || t('studyDetails.@areas'),
    size: type === TRAJECTORY_TYPE.STS ? 200 : 233,
    cell: ({ getValue, row }) => {
      const { status, isDefault, hypothesis } = row.original;
      const children = getChildrenListWithArea(row, t, type);

      return (
        <div className="flex gap-1 py-1">
          {row.getCanExpand() && (
            <button onClick={row.getToggleExpandedHandler()} style={{ cursor: 'pointer' }}>
              {row.getIsExpanded() ? (
                <StdIcon name={StdIconId.KeyboardArrowDown} />
              ) : (
                <StdIcon name={StdIconId.KeyboardArrowRight} />
              )}
            </button>
          )}
          <LabelWithButtonPreview
            value={getValue() as string}
            status={status}
            isReadOnly={row.getReadOnly()}
            hasPreview={false}
            alignment={getAlignment(row)}
            extraValue={
              hasLabelDefault(row.depth, isDefault ?? false, hypothesis) ? `(${t('studyDetails.@default')})` : ''
            }
          />
          {row.getCanExpand() && children && children?.messageNb > 0 && (
            <RdsTextTooltip text={children?.message} offset={5} placement="right">
              <div className="text-gray-600">{` | +${children?.messageNb}`}</div>
            </RdsTextTooltip>
          )}
          {row.depth === 0 && row.index === 1 && type === TRAJECTORY_TYPE.THERMAL_TECHNICAL_SPECIFIC_PARAMETER && (
            <RdsTextTooltip text={t('thermal.@paramModulationMessage')} offset={5} placement="right">
              <StdIcon name={StdIconId.Info} />
            </RdsTextTooltip>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    size: type === TRAJECTORY_TYPE.STS ? 520 : 623,
    cell: ({ row, table: { options } }) => {
      const { trajectory, status, hypothesis } = row.original;
      if (hypothesis === t('thermal.@specific') || (type === TRAJECTORY_TYPE.STS && row.depth === 0)) return null;
      return trajectory?.trajectoryName && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center gap-2">
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
              void options?.meta?.updateData?.(row.id, value.id, 'success');
            }}
            onSearch={async (value?: string) => options?.meta?.search?.(value ?? '', row.id)}
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
  ...(type === TRAJECTORY_TYPE.STS
    ? [
        columnHelper.accessor('timeSeries', {
          header: t('home.@time_series'),
          size: 160,
          cell: ({ row }) => {
            if (row.depth === 0) return null;
            return (
              <StdButton
                label={t('studyDetails.@preview')}
                icon={StdIconId.Preview}
                position="left"
                disabled={row.getReadOnly() || true} // TODO: to implement later
                onClick={() => {}}
                variant="outlined"
                size="small"
              />
            );
          },
        }),
      ]
    : []),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    size: type === TRAJECTORY_TYPE.STS ? 200 : 233,
    cell: ({ row, table: { options } }) => {
      const { status, isDefault, hypothesis, isDeletable } = row.original;
      if (hypothesis === t('thermal.@specific') || (type === TRAJECTORY_TYPE.STS && row.depth === 0)) return null;
      const shouldShowProgressBar = progress > 0 && fileStatus === 'loading' && idSelected === row.id;

      return shouldShowProgressBar ? (
        <ProgressBar statusFile={fileStatus} progressValue={progress} />
      ) : (
        <div className="flex items-center gap-1">
          <CellWithStatus status={status} />
          {options?.meta?.removeRow && !isDefault && studyState !== StudyStatus.GENERATED && (
            <div className={`${isDeletable ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}>
              <StdIconButton
                icon={StdIconId.Delete}
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

export default getExpandableHypothesisTableHeaders;
