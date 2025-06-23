import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useMemo, useState } from 'react';
import { ErrorMessageType, HypothesisRowDataWithNestedRow, SelectOption } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { FileInputStatus } from 'rte-design-system-react';
import getExpandableHypothesisTableHeaders from '@/components/header/ExpandableHypothesisTableHeaders.tsx';

interface PegaseHypothesisTableProps {
  id: string;
  data: HypothesisRowDataWithNestedRow[];
  studyState: StudyStatus;
  readOnly: ReadOnlyObject;
  progress: number;
  fileStatus: FileInputStatus;
  indexSelected: number;
  handleSearch: (value?: string, area?: string) => Promise<SelectOption[] | undefined>;
  handleImport: (index: number) => Promise<void>;
  removeRow?: (value: string, parentValue?: string) => void;
}
type ExpandedState = true | Record<string, boolean>;

export const PegaseHypothesisTable = ({
  id,
  data,
  readOnly,
  progress,
  studyState,
  fileStatus,
  indexSelected,
  handleSearch,
  handleImport,
  removeRow,
}: PegaseHypothesisTableProps) => {
  const { t } = useTranslation();
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [expanded, setExpanded] = useState<ExpandedState>(
    data.every((item) => item.isDefault && item.subRows) ? {} : true,
  );

  const columns = useMemo(
    () =>
      getExpandableHypothesisTableHeaders(t, errorInfo, setErrorInfo, studyState, progress, fileStatus, indexSelected),
    [errorInfo, fileStatus, indexSelected, progress, studyState, t],
  );

  return (
    <div className="flex h-fit w-full">
      <StdSimpleTable
        id={id}
        data={data}
        columns={columns}
        enableColumnResizing={false}
        enableReadOnly={true}
        state={{ readOnly, expanded }}
        onExpandedChange={setExpanded}
        getSubRows={(originalRow) => originalRow.subRows ?? undefined}
        search={(value?: string, area?: string) => handleSearch(value, area)}
        import={(index: number) => handleImport(index)}
        removeRow={(rowIndex: number, value: unknown) => {
          removeRow?.(value as string, data[rowIndex]?.hypothesis === value ? undefined : data[rowIndex].hypothesis);
        }}
      />
    </div>
  );
};
