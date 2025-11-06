/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
import { RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { TrajectoryViewData } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import StdButton from '@common/base/stdButton/StdButton';

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
      : t('trajectoryViewModal.@title_link');

  return (
    <RdsModal size="medium">
      <RdsModal.Title onClose={onClose} customIcon={<StdIcon name={StdIconId.LinkedServices} color="secondary" />}>
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
        <StdButton label={t('project.@close')} onClick={onClose} color="primary" />
      </RdsModal.Footer>
    </RdsModal>
  );
};
