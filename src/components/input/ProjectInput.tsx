/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { fetchProjectsFromPartialName } from '@/shared/services/projectService.ts';
import { SelectDSOption } from '@/shared/types';
import { useTranslation } from 'react-i18next';
import { Select } from '@design-system-rte/react';
import { notifyAlert } from '@/shared/notification/notification.tsx';

interface ProjectManagerProps {
  valueSelected: SelectDSOption;
  onChange: (value: SelectDSOption) => void;
  required?: boolean;
}

const ProjectInput: React.FC<ProjectManagerProps> = ({ valueSelected, onChange, required = false }) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<SelectDSOption[]>([]);

  const loadProjects = async (valueLabel?: string) => {
    try {
      const projectList = await fetchProjectsFromPartialName(valueLabel ?? '');
      const projectOptions = projectList.map((project) => ({
        id: Number(project.id),
        label: project.name,
        value: project.name,
      }));
      setProjects(projectOptions);
      return projectOptions;
    } catch (error) {
      notifyAlert({
        icon: 'check',
        message: t('project.@fetch_failed'),
        content: (error as Error).message,
        type: 'error',
        filledIcon: true,
      });
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '280px',
      }}
    >
      <Select
        id="project-select"
        value={valueSelected?.value ?? ''}
        onChange={(value: string) => {
          const selectedProject = projects.find((projectOption) => projectOption.value === value);
          if (selectedProject) {
            onChange(selectedProject);
          }
        }}
        label={t('page.@project')}
        options={projects}
        multiple={false}
        required={required}
      />
    </div>
  );
};

export default ProjectInput;
