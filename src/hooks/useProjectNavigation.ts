/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';

export const useProjectNavigation = () => {
  const navigate = useNavigate();

  const navigateToProject = (projectId: string, projectName: string) => {
    navigate(`/project/${encodeURIComponent(projectName)}`, {
      state: { projectId },
    });
  };

  return { navigateToProject };
};
