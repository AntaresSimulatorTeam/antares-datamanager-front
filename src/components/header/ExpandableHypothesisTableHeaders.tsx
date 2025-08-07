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
import { OTHER_AREAS, OTHER_AREAS_LABEL } from '@/shared/const/studyConfig.ts';
import { ProgressBar } from '@/components/forms/ProgressBar.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { RdsTextTooltip } from 'rte-design-system-react';

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
): TableOptions<HypothesisRowData>['columns'] => [
  columnHelper.accessor('hypothesis', {
    header: t('studyDetails.@area'),
    size: 50,
    cell: ({ getValue, row }) => {
      const { status } = row.original;
      const getAlignment = () => {
        if (row.depth === 0) return !row.getCanExpand() ? 'pl-1' : 'pl-0';
        return 'pl-4';
      };
      const nbOfChildren: { list: string[]; nb: number } =
        row.depth === 0
          ? (row.originalSubRows || []).reduce(
              (acc: { list: string[]; nb: number }, current: HypothesisRowData) => {
                if (!!current?.trajectory?.technology?.length && current?.trajectory?.technology?.length > 0) {
                  acc.nb = acc.nb + 1;
                  acc.list.push(current.trajectory.technology);
                  return acc;
                } else {
                  return acc;
                }
              },
              { list: [], nb: 0 },
            )
          : { list: [], nb: 0 };
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
          {row.getCanExpand() && nbOfChildren.nb > 0 && (
            <RdsTextTooltip text={nbOfChildren.list.toString()} offset={5} placement="left">
              <div className={'text-gray-600'}>{` | +${nbOfChildren.nb}`}</div>
            </RdsTextTooltip>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    size: 300,
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
            onSearch={async (value?: string) =>
              options?.meta?.search?.(
                value,
                row.original.hypothesis === OTHER_AREAS_LABEL ? OTHER_AREAS : row.original.hypothesis,
              )
            }
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
          isDeletable={!isDefault && !(studyStatus === StudyStatus.GENERATED)}
          onClick={() => {
            void options?.meta?.removeRow?.(hypothesis, row.id);
          }}
        />
      );
    },
  }),
];

export default getExpandableHypothesisTableHeaders;
