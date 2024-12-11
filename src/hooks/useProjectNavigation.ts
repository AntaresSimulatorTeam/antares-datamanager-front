/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useProjectNavigation = () => {
  const navigate = useNavigate();

  const navigateToProject = useCallback(
    (projectId: string, projectName: string) => {
      // tout ce qui sors d'un hook doit être protégé du render
      navigate(`/project/${encodeURIComponent(projectName)}`, {
        state: { projectId },
      });
    },
    [navigate],
  );

  return { navigateToProject };
};
