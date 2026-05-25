/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { TrajectoryViewData } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { Button, Icon } from '@design-system-rte/react';

interface TrajectoryDataVisualisationProps {
  trajectoryData: TrajectoryViewData;
  onClose: () => void;
}

export const TrajectoryDataVisualisation = ({ trajectoryData, onClose }: TrajectoryDataVisualisationProps) => {
  const { data, columns, trajectory } = trajectoryData;
  const { t } = useTranslation();
  const title =
    trajectory.type === TRAJECTORY_TYPE.AREA
      ? t('trajectoryViewModal.@title_area')
      : trajectory.type === TRAJECTORY_TYPE.LINK
        ? t('trajectoryViewModal.@title_link')
        : t('trajectoryViewModal.@title_sts');
  const icon =
    trajectory.type === TRAJECTORY_TYPE.AREA || trajectory.type === TRAJECTORY_TYPE.LINK
      ? StdIconId.LinkedServices
      : 'battery-charging-full';

  return (
    <RdsModal size="large">
      <RdsModal.Title onClose={onClose} customIcon={<Icon name={icon} color="primary" />}>
        {`${title}: ${trajectory.trajectoryName}`}
      </RdsModal.Title>
      <RdsModal.Content>
        <div className="grow-0 overflow-auto">
          <StdSimpleTable
            id="trajectory-data"
            columnSize="rem"
            data={data}
            columns={columns}
            enableColumnResizing={false}
          />
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <Button label={t('project.@close')} onClick={onClose} variant="primary" />
      </RdsModal.Footer>
    </RdsModal>
  );
};