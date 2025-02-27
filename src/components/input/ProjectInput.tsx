/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { RdsInputText } from 'rte-design-system-react';
import { fetchProjectsFromPartialName } from '@/shared/services/projectService.ts';

interface ProjectManagerProps {
  value: string;
  onChange: (value: string) => void;
  required: boolean;
}

const ProjectInput: React.FC<ProjectManagerProps> = ({ value, onChange, required = false }) => {
  const [projects, setProjects] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = (await fetchProjectsFromPartialName(value)) as string[];
        setProjects(projectList);
      } catch (error) {
        setErrorMessage('Failed to fetch projects');
      }
    };

    if (value) {
      void loadProjects();
    } else {
      setProjects([]);
    }
  }, [value]);

  const handleProjectSelect = (project: string) => {
    onChange(project);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <RdsInputText
        label="Project"
        value={value}
        onChange={(t) => {
          onChange(t || '');
          setIsDropdownOpen(true);
        }}
        placeHolder="Select or add a project"
        variant="outlined"
        required={required}
      />
      {isDropdownOpen && projects.length > 0 && (
        <div
          className="absolute left-0 top-7 z-50 max-h-14 w-full overflow-y-auto rounded border border-gray-300 bg-gray-w shadow-2 outline-none"
          onMouseDown={(e) => e.preventDefault()} // Prevent dropdown from closing when clicking inside
        >
          {projects.map((project, index) => (
            <div
              key={index}
              className="cursor-pointer px-2 py-1 hover:bg-gray-200"
              onClick={() => handleProjectSelect(project)}
            >
              {project}
            </div>
          ))}
        </div>
      )}
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
    </div>
  );
};

export default ProjectInput;
