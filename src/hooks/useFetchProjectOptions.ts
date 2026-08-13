/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchProjectsFromPartialName } from '@/shared/services/projectService.ts';
import { notifyAlert } from '@/shared/notification/notification.tsx';
import { useTranslation } from 'react-i18next';
import { SelectDSOption } from '@/shared/types';

export const useFetchProjectOptions = (searchTerm?: string) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<SelectDSOption[]>([]);

  const fetchProjectOptions = useCallback(
    async (valueLabel: string) => {
      try {
        const projectList = await fetchProjectsFromPartialName(valueLabel ?? '');
        const projectOptions = projectList.map(({ id, name }) => ({
          id: Number(id),
          label: name,
          value: name,
        }));
        setProjects(projectOptions);
      } catch (error) {
        notifyAlert({
          icon: 'check',
          message: t('project.@fetch_failed'),
          content: (error as Error).message,
          type: 'error',
          filledIcon: true,
        });
      }
    },
    [t],
  );

  useEffect(() => {
    void fetchProjectOptions(searchTerm ?? '');
  }, [searchTerm, fetchProjectOptions]);

  return { projects };
};
