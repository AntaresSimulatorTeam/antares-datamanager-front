/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { StudyDTO } from '@/shared/types';
import { useCallback } from 'react';
import { notifyToast } from '@/shared/notification/notification.tsx';

export const useStudyNavigation = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { pathname, state } = useLocation();

  const navigateToStudy = useCallback(async (study: StudyDTO) => {
    try {
      await navigate(`/study/${encodeURIComponent(study.name)}`, {
        state: { study },
      });
    } catch (error) {
      notifyToast({
        type: 'error',
        message: (error as Error)?.message ?? 'Error during navigation',
      });
      await navigate(pathname, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        state,
      });
    }
  }, []);

  return { navigateToStudy };
};
