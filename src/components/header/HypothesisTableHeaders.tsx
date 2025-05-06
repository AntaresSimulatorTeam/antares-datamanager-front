/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { RdsButton, RdsIcon, RdsIconButton, RdsIconId } from 'rte-design-system-react';
import { AreaAndLinkRowData, RowStatus, SelectOption } from '@/shared/types';
import { TRAJECTORY_SELECTION_STATUS, TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { ButtonPreview } from '@/components/button/ButtonPreview.tsx';
import { Dispatch, SetStateAction } from 'react';
import { ErrorMessageType } from '@/components/tab/AreaLinkTab.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

const columnHelper = createColumnHelper<AreaAndLinkRowData>();

const getHypothesisTableHeaders = (
  t: (value: string) => string,
  handleUpdate: (
    trajectoryId: number,
    status?: RowStatus,
    trajectoryLabel?: string | null,
    index?: number,
  ) => Promise<void>,
  handleImport: (index: number) => Promise<void>,
  handlerSearch: (value?: string, index?: number) => Promise<SelectOption[] | undefined>,
  handleView: (index: number) => Promise<void>,
  error: { index: number; message: string },
  setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>,
  studyStatus: StudyStatus | undefined,
  tabName?: string,
  removeRow?: (index: number, name?: string) => Promise<void>,
) => [
  columnHelper.accessor('hypothesis', {
    header: tabName === TRAJECTORY_TYPE.LOAD ? t('studyDetails.@area') : t('studyDetails.@hypothesis'),
    cell: ({ getValue, row }) => {
      const { trajectory, status } = row.original;
      return (
        <div className="flex w-2/5 items-center gap-2">
          <span
            className={`${trajectory && status === TRAJECTORY_SELECTION_STATUS.OK ? 'text-primary-600' : 'text-gray-900'}`}
          >
            {getValue()}
          </span>
          {trajectory && status === TRAJECTORY_SELECTION_STATUS.OK && (
            <ButtonPreview
              label={'View'}
              icon={StdIconId.Preview}
              position={'left'}
              color={row.getReadOnly() ? 'gray-700' : 'primary-600'}
              borderColor={row.getReadOnly() ? 'gray-700' : 'acc1-600'}
              onClick={() => void handleView(row.index)}
            />
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('trajectory', {
    header: t('studyDetails.@trajectory'),
    cell: ({ row }) => {
      const { trajectory, status } = row.original;
      const textClass = studyStatus === StudyStatus.GENERATED ? 'text-primary-600' : 'text-gray-900';
      return trajectory && status !== TRAJECTORY_SELECTION_STATUS.MISSING ? (
        <div className="flex w-2/5 space-x-2 py-3">
          <span className={`${textClass}`}>{trajectory.trajectoryName}</span>
          {studyStatus != StudyStatus.GENERATED && (
            <RdsIconButton
              icon={RdsIconId.Close}
              size="small"
              onClick={() => {
                setErrorInfo({ index: row.index, message: '' });
                void handleUpdate(
                  trajectory.id,
                  status === TRAJECTORY_SELECTION_STATUS.ERROR ? 'emptyError' : 'empty',
                  null,
                  row.index,
                );
              }}
            />
          )}
        </div>
      ) : (
        <div className="flex w-2/5 items-center space-x-2">
          <div className="flex min-w-fit items-center">
            <SelectAndSearchableInput
              onSelect={(value: SelectOption) => {
                setErrorInfo({ index: row.index, message: '' });
                void handleUpdate(value.id, 'success', value.label, row.index);
              }}
              setSearchTerm={async (value?: string) => await handlerSearch(value, row.index)}
              defaultPlaceHolder={
                row.getReadOnly() && tabName === TRAJECTORY_TYPE.AREA
                  ? t('studyDetails.@select_link')
                  : t('studyDetails.@select_trajectory')
              }
              isSearchable={true}
              isInputDisabled={row.getReadOnly()}
            />
          </div>
          <span>or</span>
          <RdsButton
            label={t('studyDetails.@import_file')}
            onClick={() => {
              setErrorInfo({ index: row.index, message: '' });
              void handleImport(row.index);
            }}
            disabled={row.getReadOnly()}
          />
          {error.message && row.index === error.index && <div className="text-error-700">{error.message}</div>}
        </div>
      );
    },
  }),

  columnHelper.accessor('status', {
    header: t('home.@status'),
    cell: ({ row }) => {
      const { status, hypothesis, isDefault } = row.original;
      if (status === TRAJECTORY_SELECTION_STATUS.MISSING)
        return (
          <div className="flex flex-1 items-center gap-1">
            <StdIcon name={StdIconId.QuestionMark} color="text-warning-500" />{' '}
            {t('studyDetails.@import_status_missing')}
            {tabName === TRAJECTORY_TYPE.LOAD && !isDefault && (
              <RdsIconButton
                icon={RdsIconId.Delete}
                size="small"
                onClick={() => void removeRow?.(row.index, hypothesis)}
              />
            )}
          </div>
        );
      if (status === TRAJECTORY_SELECTION_STATUS.OK)
        return (
          <div className="flex flex-1 items-center gap-1">
            <RdsIcon name={RdsIconId.Done} color="primary-600" /> {t('studyDetails.@import_status_done')}
            {tabName === TRAJECTORY_TYPE.LOAD && !isDefault && (
              <RdsIconButton
                icon={RdsIconId.Delete}
                size="small"
                onClick={() => void removeRow?.(row.index, hypothesis)}
              />
            )}
          </div>
        );
      if (status === TRAJECTORY_SELECTION_STATUS.ERROR)
        return (
          <div className="flex flex-1 items-center gap-1">
            <RdsIcon name={RdsIconId.Info} color="error-700" /> {t('studyDetails.@import_status_error')}
            {tabName === TRAJECTORY_TYPE.LOAD && !isDefault && (
              <div className="opacity-0 hover:opacity-100">
                <RdsIconButton
                  icon={RdsIconId.Delete}
                  size="small"
                  onClick={() => void removeRow?.(row.index, hypothesis)}
                />
              </div>
            )}
          </div>
        );
      return null;
    },
  }),
];

export default getHypothesisTableHeaders;
