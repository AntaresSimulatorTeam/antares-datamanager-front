/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
import { useTranslation } from 'react-i18next';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { TrajectoryViewData } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { Button, Modal } from '@design-system-rte/react';

interface TrajectoryDataVisualisationProps {
  trajectoryData: TrajectoryViewData;
  onClose: () => void;
  isOpen: boolean;
}

export const TrajectoryDataVisualisation = ({ trajectoryData, onClose, isOpen }: TrajectoryDataVisualisationProps) => {
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
      ? 'linked-services'
      : 'battery-charging-full';

  return (
    <Modal
      isOpen={isOpen}
      closeOnOverlayClick
      icon={icon}
      iconAppearance="filled"
      id="data-visualisation-modal"
      onClose={onClose}
      primaryButton={<Button label={t('project.@close')} onClick={onClose} variant="primary" />}
      size="xl"
      title={`${title}: ${trajectory.trajectoryName}`}
      className="[&_h2]:!text-left"
      >
    <div className="w-full">
      <StdSimpleTable
        id="trajectory-data"
        columnSize="rem"
        data={data}
        columns={columns}
        enableColumnResizing={false}
      />
    </div>
  </Modal>
  );
};