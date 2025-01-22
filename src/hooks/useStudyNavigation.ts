/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';
import { StudyDTO } from '@/shared/types';
import { useCallback } from 'react';

export const useStudyNavigation = () => {
  const navigate = useNavigate();

  const navigateToStudy = useCallback((study: StudyDTO) => {
    navigate(`/study/${encodeURIComponent(study.study_name)}`, {
      state: { study },
    });
  }, []);

  return { navigateToStudy };
};
