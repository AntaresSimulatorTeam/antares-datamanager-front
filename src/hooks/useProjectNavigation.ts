/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { StudyState } from '@/shared/types';

export const useProjectNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToProject = useCallback(
    async (id: string) => {
      try {
        await navigate(`/project/${encodeURIComponent(id)}`, {
          state: { projectId: id },
        });
      } catch (error) {
        notifyToast({
          type: 'error',
          message: (error as Error)?.message ?? 'Error during navigation',
        });
        await navigate(location.pathname, {
          state: location.state as StudyState,
        });
      }
    },
    [navigate, location.pathname, location.state],
  );

  return { navigateToProject };
};
