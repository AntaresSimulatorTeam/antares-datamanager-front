/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Icon } from '@design-system-rte/react';
import { useTranslation } from 'react-i18next';
import { TRAJECTORY_SELECTION_STATUS } from '@/shared/enum/trajectory.ts';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';
import { sentenceCase } from '@/shared/utils/textUtils.ts';

export const useStatusIcons = () => {
  const { t } = useTranslation();

  const getTrajectoryStatusIcon = (status: TRAJECTORY_SELECTION_STATUS) => {
    const defaultIcon = { name: 'question-mark', color: 'var(--status-away)', label: t('studyDetails.@import_status_missing') } as const;

    const icons = {
      [TRAJECTORY_SELECTION_STATUS.OK]: { name: 'check', color: 'var(--status-available)', label: t('studyDetails.@import_status_done') },
      [TRAJECTORY_SELECTION_STATUS.ERROR]: { name: 'info', color: 'var(--status-busy)', label: t('studyDetails.@import_status_error') },
      [TRAJECTORY_SELECTION_STATUS.MISSING]: defaultIcon,
    } as const;

    const { name, color, label } = icons[status] ?? defaultIcon;

    return (
      <div className="flex items-center justify-start gap-1">
        <Icon name={name} color={color} />
        {label}
      </div>
    );
  };

  const getGenerationStatusIcon = (status: StudyStatus) => {
    const defaultIcon = { name: 'trending-up', color: '#1465FC' } as const;

    const icons = {
      [StudyStatus.GENERATED]: { name: 'download-done', color: 'var(--status-available)' },
      [StudyStatus.ERROR]: { name: 'error', color: 'var(--status-busy)' },
      [StudyStatus.GENERATION_IN_PROGRESS]: { name: 'settings', color: 'var(--status-away)' },
      [StudyStatus.IN_PROGRESS]: defaultIcon,
    } as const;

    const { name, color } = icons[status] ?? defaultIcon;

    return (
      <div className="flex gap-2">
        <Icon name={name} color={color} />
        <span>{sentenceCase(status)}</span>
      </div>
    );
  };

  return { getTrajectoryStatusIcon, getGenerationStatusIcon };
};
