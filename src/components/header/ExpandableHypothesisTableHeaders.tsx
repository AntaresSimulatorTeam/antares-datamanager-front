/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper, TableOptions } from '@tanstack/react-table';
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
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { RdsTextTooltip } from 'rte-design-system-react';
import { getChildrenList } from '@/shared/utils/trajectoryUtils.ts';

const columnHelper = createColumnHelper<HypothesisRowData>();

export interface ExpandableHypothesisTableHeadersProps {
  t: (value: string) => string;
  error: ErrorMessageType;
  setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>;
  studyStatus: StudyStatus | undefined;
  progress: number;
  fileStatus: FileInputStatus;
  indexSelected: number;
}

const getExpandableHypothesisTableHeaders = (
  t: (value: string) => string,
  error: ErrorMessageType,
  setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>,
  studyStatus: StudyStatus | undefined,
  progress: number,
  fileStatus: FileInputStatus,
  idSelected: string,
  columnHeader?: string,
): TableOptions<HypothesisRowData>['columns'] => [
  columnHelper.accessor('hypothesis', {
    header: columnHeader || t('studyDetails.@area'),
    size: 120,
    cell: ({ getValue, row }) => {
      const { status } = row.original;
      const getAlignment = () => {
        if (row.depth === 0) return !row.getCanExpand() ? 'pl-1' : 'pl-0';
        return 'pl-4';
      };
      const childrenArray: string[] = getChildrenList(row);
      return (
        <div className="flex gap-1">
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
            alignment={getAlignment()}
          />
          {row.getCanExpand() && childrenArray.length > 0 && (
            <RdsTextTooltip text={childrenArray.toString()} offset={5} placement="right">
              <div className={'text-gray-600'}>{` | +${childrenArray.length}`}</div>
            </RdsTextTooltip>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    size: 350,
    cell: ({ row, table: { options } }) => {
      const { trajectory, status } = row.original;

      return trajectory?.trajectoryName && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-full items-center gap-2">
          <LabelWithDeleteButton
            label={trajectory.trajectoryName}
            isDeletable={studyStatus !== StudyStatus.GENERATED}
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
          {error.message && row.index === error.index && <div className="text-error-700">{error.message}</div>}
        </div>
      );
    },
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    cell: ({ row, table: { options } }) => {
      const { status, isDefault, hypothesis } = row.original;
      return progress > 0 && fileStatus === 'loading' && idSelected === row.id ? (
        <ProgressBar statusFile={fileStatus} progressValue={progress} />
      ) : (
        <CellWithStatus
          status={status}
          isDeletable={!isDefault && studyStatus !== StudyStatus.GENERATED}
          onClick={() => {
            void options?.meta?.removeRow?.(hypothesis, row.id);
          }}
        />
      );
    },
  }),
];

export default getExpandableHypothesisTableHeaders;
