/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useProjectNavigation = () => {
  const navigate = useNavigate();

  const navigateToProject = useCallback(
    async (id: string, name: string) => {
      await navigate(`/project/${encodeURIComponent(name)}`, {
        state: { projectId: id },
      });
    },
    [navigate],
  );

  return { navigateToProject };
};
