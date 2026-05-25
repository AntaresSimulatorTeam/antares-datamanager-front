/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { fetchProjectsFromPartialName } from '@/shared/services/projectService.ts';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { SelectOption } from '@/shared/types';
import { useTranslation } from 'react-i18next';

interface ProjectManagerProps {
  value: SelectOption;
  onChange: (value: SelectOption) => void;
  required?: boolean;
}

const ProjectInput: React.FC<ProjectManagerProps> = ({ value, onChange, required = false }) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<SelectOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadProjects = async (valueLabel?: string) => {
    try {
      const projectList = await fetchProjectsFromPartialName(valueLabel ?? '');
      const projectOptions = projectList.map((project) => ({ id: Number(project.id), label: project.name }));
      setProjects(projectOptions);
      return projectOptions;
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to fetch projects');
    }
  };

  const onSelect = (project: SelectOption) => {
    onChange(project);
  };

  return (
    <div className="flex flex-col items-start justify-start">
      <SelectAndSearchableInput
        label={t('page.@project')}
        onSelect={(valueSelected: SelectOption) => void onSelect(valueSelected)}
        setSearchTerm={async (valueSearch?: string) => await loadProjects(valueSearch)}
        isSearchable={true}
        options={projects}
        errorMessage={errorMessage}
        defaultValue={value?.label}
        required={required}
      />
    </div>
  );
};

export default ProjectInput;
