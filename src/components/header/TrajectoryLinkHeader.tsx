import { createColumnHelper } from '@tanstack/react-table';
import { TrajectoryLinkData } from '@/shared/types';

const columnHelperLink = createColumnHelper<TrajectoryLinkData>();

const getTrajectoryLinkHeader = (t: (value: string) => string) => [
  columnHelperLink.accessor('link_name', {
    header: t('trajectoryViewModal.@areaName'),
    cell: ({ getValue }) => <span>{getValue()}</span>,
  }),
  columnHelperLink.accessor('direct_w_hp', {
    header: t('trajectoryViewModal.@areaPowerToGas'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('direct_w_hc', {
    header: t('trajectoryViewModal.@shortTermStorage'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('direct_s_hp', {
    header: t('trajectoryViewModal.@areaName'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('direct_s_hc', {
    header: t('trajectoryViewModal.@areaPowerToGas'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('indirect_w_hp', {
    header: t('trajectoryViewModal.@shortTermStorage'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('indirect_w_hc', {
    header: t('trajectoryViewModal.@areaName'),
    cell: ({ getValue }) => <span>{getValue()}</span>,
  }),
  columnHelperLink.accessor('indirect_s_hp', {
    header: t('trajectoryViewModal.@areaPowerToGas'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('indirect_s_hc', {
    header: t('trajectoryViewModal.@shortTermStorage'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('flowbased_perimeter', {
    header: t('trajectoryViewModal.@areaName'),
    cell: ({ getValue }) => <span>{getValue()}</span>,
  }),
  columnHelperLink.accessor('hvdc', {
    header: t('trajectoryViewModal.@areaPowerToGas'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('specific_ts', {
    header: t('trajectoryViewModal.@shortTermStorage'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('forced_outage_hvac', {
    header: t('trajectoryViewModal.@areaPowerToGas'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
  columnHelperLink.accessor('hurdle_cost', {
    header: t('trajectoryViewModal.@shortTermStorage'),
    cell: ({ getValue }) => <div className="bg-gray-400 p-0">{getValue()}</div>,
  }),
];

export default getTrajectoryLinkHeader;
