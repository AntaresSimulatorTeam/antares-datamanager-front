import { createColumnHelper } from '@tanstack/react-table';
import { TrajectoryAreaData } from '@/shared/types';

const columnHelperArea = createColumnHelper<TrajectoryAreaData>();

const getTrajectoryAreaHeader = (t: (value: string) => string) => [
  columnHelperArea.accessor('area_name', {
    header: t('trajectoryViewModal.@areaName'),
    cell: ({ getValue }) => <span>{getValue()}</span>,
  }),
  columnHelperArea.accessor('power_to_gas', {
    header: t('trajectoryViewModal.@areaPowerToGas'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperArea.accessor('short_term_storage', {
    header: t('trajectoryViewModal.@shortTermStorage'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
];

export default getTrajectoryAreaHeader;
