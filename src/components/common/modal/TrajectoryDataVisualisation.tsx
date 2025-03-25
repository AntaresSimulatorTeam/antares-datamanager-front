import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { TrajectoryAreaALinkViewData } from '@/components/tab/AreaLinkTab.tsx';

interface TrajectoryDataVisualisationProps {
  trajectoryData: TrajectoryAreaALinkViewData;
  onClose: () => void;
}

export const TrajectoryDataVisualisation = ({ trajectoryData, onClose }: TrajectoryDataVisualisationProps) => {
  const { t } = useTranslation();
  const { data, columns } = trajectoryData;

  return (
    <RdsModal size="medium">
      <RdsModal.Title onClose={onClose}>{t('trajectoryViewModal.@title')}</RdsModal.Title>
      <RdsModal.Content>
        <StdSimpleTable
          id="trajectory-data"
          // @ts-ignore
          data={data}
          // @ts-ignore
          columns={columns}
          columnSize="meta"
          enableColumnResizing={false}
        />
      </RdsModal.Content>
    </RdsModal>
  );
};
