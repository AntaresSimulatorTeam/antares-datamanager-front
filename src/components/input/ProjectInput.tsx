/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { RdsInputText } from 'rte-design-system-react';
import { fetchProjectsFromPartialName } from '@/shared/services/projectService.ts';
import { useAuth } from 'react-oidc-context';

interface ProjectManagerProps {
  value: string;
  onChange: (value: string) => void;
}

const ProjectInput: React.FC<ProjectManagerProps> = ({ value, onChange }) => {
  const [projects, setProjects] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const authContext = useAuth();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = (await fetchProjectsFromPartialName(value, authContext?.user?.access_token)) as string[];
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
      />
      {isDropdownOpen && projects.length > 0 && (
        <div
          className="bg-white max-h-40 absolute z-10 mt-1 w-full overflow-y-auto border border-gray-300"
          style={{
            backgroundColor: 'white', // Ensure opaque background
            maxHeight: '100px', // Set max height for scrollbar
            top: '100%',
            left: 0,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Optional: add shadow for better visibility
          }}
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
