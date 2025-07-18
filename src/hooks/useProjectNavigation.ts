/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Location, useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { notifyToast } from '@/shared/notification/notification.tsx';
import { StudyState } from '@/shared/types';

export const useProjectNavigation = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const location: Location<StudyState> = useLocation();
  const { pathname, state } = location || {};

  const navigateToProject = useCallback(
    async (id: string, name: string) => {
      console.log('=============== navigateToProject');
      try {
        await navigate(`/project/${encodeURIComponent(name)}`, {
          state: { projectId: id },
        });
      } catch (error) {
        notifyToast({
          type: 'error',
          message: (error as Error)?.message ?? 'Error during navigation',
        });
        await navigate(pathname, {
          state,
        });
      }
    },
    [navigate, pathname, state],
  );

  return { navigateToProject };
};
