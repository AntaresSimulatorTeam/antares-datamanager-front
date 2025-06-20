import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { useMemo, useState } from 'react';
import getNestedHypothesisTableHeaders from '@/components/header/NestedHypothesisTableHeaders.tsx';
import { ErrorMessageType, HypothesisRowData, SelectOption } from '@/shared/types';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { useTranslation } from 'react-i18next';
import { ReadOnlyObject } from '@common/data/stdTable/types/readOnly.type';
import { FileInputStatus } from 'rte-design-system-react';

interface PegaseHypothesisTableProps {
  id: string;
  data: HypothesisRowData[];
  studyState: StudyStatus;
  readOnly: ReadOnlyObject;
  progress: number;
  fileStatus: FileInputStatus;
  indexSelected: number;
  handleSearch: (value?: string, area?: string) => Promise<SelectOption[] | undefined>;
  handleImport: (index: number) => Promise<void>;
}

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
  const [errorInfo, setErrorInfo] = useState<ErrorMessageType>({ index: 0, message: '' });
  const { t } = useTranslation();

  const columns = useMemo(
    () => getNestedHypothesisTableHeaders(t, errorInfo, setErrorInfo, studyState, progress, fileStatus, indexSelected),
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
        state={{ readOnly }}
        search={(value?: string, area?: string) => handleSearch(value, area)}
        import={(index: number) => handleImport(index)}
      />
    </div>
  );
};
