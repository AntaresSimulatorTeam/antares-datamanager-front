/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
import { RdsButton, RdsModal } from 'rte-design-system-react';
import { useTranslation } from 'react-i18next';
import StdSimpleTable from '@common/data/stdSimpleTable/StdSimpleTable.tsx';
import { TrajectoryAreaALinkViewData } from '@/shared/types';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import StdIcon from '@common/base/stdIcon/StdIcon.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';

interface TrajectoryDataVisualisationProps {
  trajectoryData: TrajectoryAreaALinkViewData;
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
        <div className="max-w-screen-xl overflow-x-auto overflow-y-auto">
          <StdSimpleTable
            id="trajectory-data"
            // @ts-ignore
            data={data}
            // @ts-ignore
            columns={columns}
            columnSize="pixels"
            enableColumnResizing={false}
            cellClassName="p-0"
          />
        </div>
      </RdsModal.Content>
      <RdsModal.Footer>
        <RdsButton label={t('project.@close')} onClick={onClose} color="primary" />
      </RdsModal.Footer>
    </RdsModal>
  );
};
