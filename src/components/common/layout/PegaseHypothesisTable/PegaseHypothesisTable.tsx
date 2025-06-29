import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { ErrorMessageType, HypothesisRowData, RowStatus, SelectOption } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { FileInputStatus } from 'rte-design-system-react';
import { TableOptions } from '@tanstack/react-table';

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
    indexSelected: number,
    columnHeader?: string,
  ) => TableOptions<HypothesisRowData>['columns'];
  studyState: StudyStatus;
  readOnly?: ReadOnlyObject;
  progress: number;
  fileStatus: FileInputStatus;
  indexSelected: number;
  handleSearch: (value?: string, area?: string) => Promise<SelectOption[] | undefined>;
  handleImport: (index: number) => Promise<void>;
  isReadOnlyEnable?: boolean;
  removeRow?: (value: string, rowIndex?: number) => void | Promise<void>;
  updateData?: (rowIndex: number, value: unknown, status?: RowStatus, label?: string) => void;
  columnHeader?: string;
}
type ExpandedState = true | Record<string, boolean>;

export const PegaseHypothesisTable = ({
  id,
  data,
  getTableHeaders,
  readOnly,
  progress,
  studyState,
  fileStatus,
  indexSelected,
  handleSearch,
  handleImport,
  isReadOnlyEnable = false,
  removeRow,
  updateData,
  columnHeader,
}: PegaseHypothesisTableProps) => {
  const { t } = useTranslation();
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [expanded, setExpanded] = useState<ExpandedState>(
    data.every((item) => item.isDefault && item?.subRows) ? {} : true,
  );

  const columns: TableOptions<HypothesisRowData>['columns'] = useMemo(
    () => getTableHeaders(t, errorInfo, setErrorInfo, studyState, progress, fileStatus, indexSelected, columnHeader),
    [errorInfo, fileStatus, indexSelected, progress, studyState, t, columnHeader],
  );

  const onHandleImport = async (index: number) => {
    try {
      await handleImport(index);
    } catch {
      setErrorInfo({ index, message: t('studyDetails.@select_file_fs_error') });
    }
  };

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
        search={(value?: string, area?: string) => handleSearch(value, area)}
        importData={async (index: number) => await onHandleImport(index)}
        removeRow={(value: string, rowIndex?: number) => {
          void removeRow?.(value, rowIndex);
        }}
        updateData={(rowIndex: number, value: unknown, status?: RowStatus, label?: string) =>
          void updateData?.(rowIndex, value, status, label)
        }
      />
    </div>
  );
};
