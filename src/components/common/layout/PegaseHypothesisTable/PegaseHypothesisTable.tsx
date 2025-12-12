import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ErrorMessageType,
  ExpandedState,
  HypothesisRowData,
  RowStatus,
  SelectOption,
  TableHeadersGetterProps,
  TableHeadersProps,
} from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { TableOptions } from '@tanstack/react-table';

interface PegaseHypothesisTableProps extends TableHeadersProps {
  id: string;
  data: HypothesisRowData[];
  getTableHeaders: (context: TableHeadersGetterProps) => TableOptions<HypothesisRowData>['columns'];
  readOnly?: ReadOnlyObject;
  handleSearch: (value: string, area: string) => Promise<SelectOption[] | undefined>;
  handleImport: (rowId: string) => Promise<void>;
  isReadOnlyEnable?: boolean;
  removeRow?: (value: string, rowId?: string) => void | Promise<void>;
  updateData?: (rowId: string, value: unknown, status: RowStatus) => void | Promise<void>;
  handleViewData?: (rowId: string) => void | Promise<void> | undefined;
  list?: string[];
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
  handleViewData,
  columnHeader,
  type,
  list,
}: PegaseHypothesisTableProps) => {
  const { t } = useTranslation();
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [expanded, setExpanded] = useState<ExpandedState>({});

  useEffect(() => {
    setExpanded({});
  }, [data.length]);

  const columns: TableOptions<HypothesisRowData>['columns'] = useMemo(
    () =>
      getTableHeaders({
        t,
        errorInfo,
        setErrorInfo,
        studyState,
        progress,
        fileStatus,
        idSelected,
        columnHeader,
        type,
        list,
      }),
    [getTableHeaders, t, errorInfo, studyState, progress, fileStatus, idSelected, columnHeader, type, list],
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
        columnSize="rem"
        enableColumnResizing={false}
        enableReadOnly={isReadOnlyEnable}
        state={isReadOnlyEnable ? { readOnly, expanded } : { expanded }}
        onExpandedChange={setExpanded}
        getSubRows={(originalRow) => originalRow.subRows ?? undefined}
        search={(value: string, rowId: string) => handleSearch(value, rowId)}
        importData={async (rowId: string) => await onHandleImport(rowId)}
        removeRow={(value: string, rowId?: string) => void removeRow?.(value, rowId)}
        updateData={(rowId: string, value: unknown, status: RowStatus) => void updateData?.(rowId, value, status)}
        viewData={handleViewData ? (rowId: string) => void handleViewData?.(rowId) : undefined}
      />
    </div>
  );
};
