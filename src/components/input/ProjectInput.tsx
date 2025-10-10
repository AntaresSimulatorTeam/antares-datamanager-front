/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { fetchProjectsFromPartialName } from '@/shared/services/projectService.ts';
import SelectAndSearchableInput from '@/components/input/SelectAndSearchableInput.tsx';
import { SelectOption } from '@/shared/types';
import { useTranslation } from 'react-i18next';

interface ProjectManagerProps {
  value: string;
  onChange: (value: string) => void;
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

  useEffect(() => {
    void loadProjects();
  }, []);

  const onSelect = (project: SelectOption) => {
    onChange(project.label);
  };

  return (
    <div className="flex flex-col items-start justify-start">
      <div className="my-0.25 flex items-center justify-start p-0.5 text-button-s">
        <div className="text-gray-700">{t('page.@project')}</div>
        {required && <div className={'text-error-600'}>*</div>}
      </div>
      <SelectAndSearchableInput
        onSelect={(valueSelected: SelectOption) => void onSelect(valueSelected)}
        setSearchTerm={async (valueSearch?: string) => await loadProjects(valueSearch)}
        defaultPlaceHolder={value ?? t('studyDetails.@select_project')}
        isSearchable={true}
        options={projects}
        errorMessage={errorMessage}
        defaultValue={value}
      />
    </div>
  );
};

export default ProjectInput;
