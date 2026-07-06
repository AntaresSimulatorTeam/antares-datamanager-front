/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper, TableOptions } from '@tanstack/react-table';
import { HypothesisRowData, SelectOption, TableHeadersGetterProps } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithButtonPreview } from '@common/data/LabelWithButtonPreview.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';
import { ProgressBar } from '@/components/input/ProgressBar.tsx';
import { getAlignment, hasLabelDefault } from '@/shared/utils/hypothesisTableUtils.ts';
import { getSubRowListWithArea, getSubRowsList, isEmptyRow } from '@/shared/utils/trajectoryUtils.ts';
import { getInformationMessage } from '@/shared/helpers/hypothesisTableHelper.ts';
import { Button, Icon, IconButton } from '@design-system-rte/react';
import StdTextTooltip from '@common/layout/stdTextTooltip/StdTextTooltip.tsx';

const columnHelper = createColumnHelper<HypothesisRowData>();
const getExpandableHypothesisTableHeaders = ({
  t,
  errorInfo,
  setErrorInfo,
  isStudyGenerated,
  progress,
  fileStatus,
  idSelected,
  columnHeader,
  type,
  list,
}: TableHeadersGetterProps): TableOptions<HypothesisRowData>['columns'] => [
  columnHelper.accessor('hypothesis', {
    header: columnHeader || t('studyDetails.@areas'),
    size: type === TRAJECTORY_TYPE.STS ? 200 : 233,
    cell: ({ getValue, row, table }) => {
      const { status, isDefault, hypothesis, trajectory } = row.original;
      const subRowListName = getSubRowsList(row);
      const subRowListWithArea = getSubRowListWithArea(subRowListName, t, type);
      const isTechnology = list?.length ? list?.includes(hypothesis) : false;
      const informationMessage = type ? getInformationMessage(table.getRowCount(), type, row.id, trajectory) : null;

      return (
        <div className="flex items-center gap-1 py-1">
          {row.getCanExpand() && (
            <IconButton
              appearance="outlined"
              aria-label="icon button aria label"
              name={row.getIsExpanded() ? 'arrow-chevron-down' : 'arrow-chevron-right'}
              onClick={row.getToggleExpandedHandler()}
              size="s"
              variant="transparent"
            />
          )}
          <LabelWithButtonPreview
            value={getValue() as string}
            status={status}
            isReadOnly={row.getReadOnly()}
            hasPreview={false}
            alignment={getAlignment(row)}
            extraValue={
              hasLabelDefault(row.depth, isDefault ?? false, hypothesis, isTechnology)
                ? `(${t('studyDetails.@default')})`
                : ''
            }
          />
          {row.getCanExpand() && subRowListWithArea && subRowListWithArea?.messageNb > 0 && (
            <StdTextTooltip text={subRowListWithArea?.message} placement="right" offset={5}>
              <div className="text-gray-600">{` | +${subRowListWithArea?.messageNb}`}</div>
            </StdTextTooltip>
          )}
          {row.id === informationMessage?.id && informationMessage && (
            <StdTextTooltip text={t(`${informationMessage.messageKey}`)} placement="right" offset={5}>
              <Icon
                appearance="outlined"
                aria-label="info"
                color={row.getReadOnly() ? '#6f767b' : '#11161a'}
                name="info"
                size={16}
              />
            </StdTextTooltip>
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
      if (type && isEmptyRow(type, hypothesis, row.depth, t)) return null;
      return trajectory?.trajectoryName && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center gap-2 py-1">
          <LabelWithDeleteButton
            label={trajectory.trajectoryName}
            isDeletable={!isStudyGenerated}
            onClick={() => {
              setErrorInfo({ index: row.index, message: '' });
              void options?.meta?.updateData?.(
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
          cell: ({ row, table: { options } }) => {
            if (row.depth === 0) return null;
            const { trajectory, status } = row.original;
            const hasTrajectory =
              trajectory?.hasTimeSeries && trajectory?.trajectoryName && status === TRAJECTORY_SELECTION_STATUS.OK;
            return (
              <Button
                label={t('studyDetails.@preview')}
                onClick={() => void options?.meta?.viewData?.(row.id)}
                variant="primary"
                disabled={(row.getReadOnly() && !hasTrajectory) || (!isStudyGenerated && !hasTrajectory)}
                icon="visibility-show"
                iconAppearance="filled"
                size="s"
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
      const hasNoInput =
        (type &&
          (type === TRAJECTORY_TYPE.STS ||
            type === TRAJECTORY_TYPE.HYDRO_SERIES ||
            type === TRAJECTORY_TYPE.HYDRO_PSP_SERIES) &&
          row.depth === 0) ||
        (type === TRAJECTORY_TYPE.NUCLEAR_FR_MODULATION && row.id === '2');
      if (
        hypothesis === t('thermal.@specific') ||
        (hasNoInput && isDefault) ||
        (hasNoInput && !isDefault && isStudyGenerated)
      )
        return null;
      if (hasNoInput && !isDefault) {
        return (
          <div className={`${isDeletable ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}>
            <IconButton
              appearance="outlined"
              aria-label="icon button aria label"
              name="delete"
              onClick={() => void options?.meta?.removeRow?.(hypothesis, row.id)}
              size="s"
              variant="transparent"
            />
          </div>
        );
      } else {
        const shouldShowProgressBar = progress > 0 && fileStatus === 'loading' && idSelected === row.id;

        return shouldShowProgressBar ? (
          <ProgressBar statusFile={fileStatus} progressValue={progress} />
        ) : (
          <div className="flex items-center gap-1">
            <CellWithStatus status={status} />
            {options?.meta?.removeRow && !isDefault && !isStudyGenerated && (
              <div className={`${isDeletable ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}>
                <IconButton
                  appearance="outlined"
                  aria-label="icon button aria label"
                  name="delete"
                  onClick={() => void options?.meta?.removeRow?.(hypothesis, row.id)}
                  size="s"
                  variant="transparent"
                />
              </div>
            )}
          </div>
        );
      }
    },
  }),
];

export default getExpandableHypothesisTableHeaders;
