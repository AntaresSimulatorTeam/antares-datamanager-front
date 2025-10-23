import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ErrorMessageType,
  ExpandedState,
  FileInputStatus,
  HypothesisRowData,
  RowStatus,
  SelectOption,
} from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { TableOptions } from '@tanstack/react-table';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';

interface PegaseHypothesisTableProps {
  id: string;
  data: HypothesisRowData[];
  getTableHeaders: (
    t: (key: string) => string,
    errorInfo: ErrorMessageType,
    setErrorInfo: Dispatch<SetStateAction<ErrorMessageType>>,
    studyState: StudyStatus,
    progress: number,
    fileStatus: FileInputStatus,
    idSelected: string,
    columnHeader?: string,
    type?: TRAJECTORY_TYPE,
  ) => TableOptions<HypothesisRowData>['columns'];
  studyState: StudyStatus;
  readOnly?: ReadOnlyObject;
  progress: number;
  fileStatus: FileInputStatus;
  idSelected: string;
  handleSearch: (value: string, area: string) => Promise<SelectOption[] | undefined>;
  handleImport: (rowId: string) => Promise<void>;
  isReadOnlyEnable?: boolean;
  removeRow?: (value: string, rowId?: string) => void | Promise<void>;
  updateData?: (rowId: string, value: unknown, status: RowStatus) => void;
  columnHeader?: string;
  type?: TRAJECTORY_TYPE;
}

export const PegaseHypothesisTable = ({
  id,
  data,
  getTableHeaders,
  readOnly,
  progress,
  studyState,
  fileStatus,
  idSelected,
  handleSearch,
  handleImport,
  isReadOnlyEnable = false,
  removeRow,
  updateData,
  columnHeader,
  type,
}: PegaseHypothesisTableProps) => {
  const { t } = useTranslation();
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [expanded, setExpanded] = useState<ExpandedState>({});

  useEffect(() => {
    setExpanded({});
  }, [data.length]);

  const columns: TableOptions<HypothesisRowData>['columns'] = useMemo(
    () => getTableHeaders(t, errorInfo, setErrorInfo, studyState, progress, fileStatus, idSelected, columnHeader, type),
    [getTableHeaders, t, errorInfo, studyState, progress, fileStatus, idSelected, columnHeader],
  );

  const onHandleImport = useCallback(
    async (rowId: string) => {
      try {
        await handleImport(rowId);
      } catch {
        setErrorInfo({ index: Number(rowId), message: t('studyDetails.@select_file_fs_error') });
      }
    },
    [handleImport, t],
  );

  return (
    <div className="flex h-fit w-full">
      <StdSimpleTable
        id={id}
        data={data}
        columns={columns}
        enableColumnResizing={false}
        enableReadOnly={isReadOnlyEnable}
        state={isReadOnlyEnable ? { readOnly, expanded } : { expanded }}
        onExpandedChange={setExpanded}
        getSubRows={(originalRow) => originalRow.subRows ?? undefined}
        search={(value: string, rowId: string) => handleSearch(value, rowId)}
        importData={async (rowId: string) => await onHandleImport(rowId)}
        removeRow={(value: string, rowId?: string) => void removeRow?.(value, rowId)}
        updateData={(rowId: string, value: unknown, status: RowStatus) => void updateData?.(rowId, value, status)}
      />
    </div>
  );
};
