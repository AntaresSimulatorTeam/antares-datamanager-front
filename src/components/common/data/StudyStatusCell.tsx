/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useStatusIcons } from '@/hooks/useStatusIcons.tsx';
import { StudyStatus } from '@/shared/types/common/StudyStatus.type.ts';

interface StudyStatusCellProps {
  status: StudyStatus;
}

export const StudyStatusCell = ({ status }: StudyStatusCellProps) => {
  const { getGenerationStatusIcon } = useStatusIcons();

  return getGenerationStatusIcon(status);
};
