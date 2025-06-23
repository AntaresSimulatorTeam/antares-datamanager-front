import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useMemo, useState } from 'react';
import { ErrorMessageType, HypothesisRowDataWithNestedRow, SelectOption } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { FileInputStatus } from 'rte-design-system-react';
import getExpandableHypothesisTableHeaders from '@/components/header/getExpandableHypothesisTableHeaders.tsx';

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
}: PegaseHypothesisTableProps) => {
  const { t } = useTranslation();
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columns = useMemo(
    () =>
      getExpandableHypothesisTableHeaders(t, errorInfo, setErrorInfo, studyState, progress, fileStatus, indexSelected),
    [data, errorInfo, studyState, progress, fileStatus, indexSelected],
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
        search={(value?: string, area?: string) => handleSearch(value, area)}
        import={(index: number) => handleImport(index)}
        getSubRows={(originalRow) => originalRow.subRows ?? undefined}
      />
    </div>
  );
};
