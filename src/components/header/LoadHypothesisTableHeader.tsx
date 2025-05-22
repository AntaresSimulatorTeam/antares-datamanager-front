/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { HypothesisRowData, SelectOption } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { Dispatch, SetStateAction } from 'react';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { CellWithStatus } from '@common/data/CellWithStatus.tsx';
import { LabelWithButtonPreview } from '@common/data/LabelWithButtonPreview.tsx';
import { LabelWithDeleteButton } from '@common/data/LabelWithDeleteButton.tsx';
import { SelectInputWithButton } from '@common/data/SelectInputWithButton.tsx';
import { ErrorMessageType } from '@/shared/types/Generic.type.ts';
import {AREA_OTHERS} from "@/shared/const/studyConfig.ts";

const columnHelper = createColumnHelper<HypothesisRowData>();

const getLoadHypothesisTableHeaders = (
  t: (value: string) => string,
  handleImport: (index: number) => Promise<void>,
  handlerSearch: (value?: string, area?: string) => Promise<SelectOption[] | undefined>,
  handleView: (index: number) => Promise<void>,
  error: ErrorMessageType,
  setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>,
  studyStatus: StudyStatus | undefined,
) => [
  columnHelper.accessor('hypothesis', {
    header: t('studyDetails.@area'),
    cell: ({ getValue, row }) => {
      const { status } = row.original;
      return (
        <div className="flex">
          <LabelWithButtonPreview
            value={getValue()}
            status={status}
            isReadOnly={row.getReadOnly()}
            onClick={() => void handleView(row.index)}
            hasPreview={false}
          />
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    cell: ({ row, table: { options } }) => {
      const { trajectory, status } = row.original;

      return trajectory?.trajectoryName && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-3/5 items-center space-x-2">
          <LabelWithDeleteButton
            label={trajectory.trajectoryName}
            isDeletable={!(studyStatus === StudyStatus.GENERATED)}
            onClick={() => {
              setErrorInfo({ index: row.index, message: '' });
              void options?.meta?.updateData?.(
                row.index,
                trajectory.id,
                status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'emptyError' : 'empty',
              );
            }}
          />
        </div>
      ) : (
        <div className="flex w-3/5 items-center space-x-2">
          <SelectInputWithButton
            onSelect={(value: SelectOption) => {
              setErrorInfo({ index: row.index, message: '' });
              void options?.meta?.updateData?.(row.index, value.id, 'success');
            }}
            onSearch={async (value?: string) => await handlerSearch(value, row.original.hypothesis === 'Others areas' ? AREA_OTHERS : row.original.hypothesis)}
            onClickButton={() => {
              setErrorInfo({ index: row.index, message: '' });
              void handleImport(row.index);
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
      const { status, hypothesis, isDefault } = row.original;
      return (
        <CellWithStatus
          status={status}
          isDeletable={!isDefault}
          onClick={() => void options?.meta?.removeRow?.(row.index, hypothesis)}
        />
      );
    },
  }),
];

export default getLoadHypothesisTableHeaders;
