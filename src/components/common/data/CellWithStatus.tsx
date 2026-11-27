import { useStatusIcons } from '@/hooks/useStatusIcons.tsx';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';

interface CellWithStatusProps {
  status: TRAJECTORY_SELECTION_STATUS;
}

export const CellWithStatus = ({ status }: CellWithStatusProps) => {
  const { getTrajectoryStatusIcon } = useStatusIcons();

  return getTrajectoryStatusIcon(status);
};
