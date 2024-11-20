/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StdChip from '@common/base/stdChip/StdChip';
import SearchBar from '@/pages/pegase/home/components/SearchBar';
import PegaseCard from '@/components/pegase/pegaseCard/pegaseCard';
import StdTagList from '@common/base/StdTagList/StdTagList';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar';
import { getEnvVariables } from '@/envVariables';
import { ProjectInfo } from '@/shared/types/pegase/Project.type';
import { useProjectDropdown } from '@/components/pegase/pegaseCard/useProjectDropdown';
import StudiesPagination from '@/pages/pegase/home/components/StudiesPagination';

const ProjectContent = () => {
  const intervalSize = 9;
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
  const userName = 'mouad'; // Replace with actual user name
  const BASE_URL = getEnvVariables('VITE_BACK_END_BASE_URL');
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const dropdownItems = useProjectDropdown();
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchProjects = () => {
      const url = `${BASE_URL}/v1/project/search?page=${current + 1}&size=${intervalSize}&search=${searchTerm || ''}`;
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          setProjects(json.content);
          setCount(json.totalElements);
        })
        .catch((error) => console.error(error));
    };
    fetchProjects();
  }, [BASE_URL, current, searchTerm]);

  const searchProject = (value?: string | undefined) => {
    setSearchTerm(value);
  };
  const handleChipClick = () => {
    if (activeChip) {
      setActiveChip(false);
      setSearchTerm('');
    } else {
      setActiveChip(true);
      setSearchTerm(userName);
    }
  };
  return (
    <div className="flex w-full flex-1 flex-col gap-3">
      <div className="flex gap-4 py-2">
        <SearchBar onSearch={searchProject} chipLabels={['']} />
        <StdChip
          label={t('home.@my_projects')}
          onClick={handleChipClick}
          status={activeChip ? 'secondary' : 'primary'}
        />
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {projects.map((project) => (
          <PegaseCard key={project.projectId} title={project.name} dropdownOptions={dropdownItems} id="1">
            <div className="flex flex-col items-start justify-between">
              <div className="flex items-center gap-1">
                {project.tags && (
                  <div className="flex h-3 w-32">
                    <StdTagList id={`${project.projectId}-tag-list`} tags={project.tags} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-x-0.5 pt-2.5">
                <div className="font-sans text-body-xs font-light">
                  {t('project.@created')} :{' '}
                  <span className="text-body-xs font-bold">{formatDateToDDMMYYYY(project.creationDate)} </span>{' '}
                  {t('project.@by')} :
                </div>

                <StdAvatar
                  size="es"
                  backgroundColor="gray"
                  fullname={project.createdBy}
                  initials={project.createdBy.substring(0, 2)}
                />
                <span className="font-sans text-body-xs font-light">{project.createdBy}</span>
              </div>
            </div>
          </PegaseCard>
        ))}
      </div>

      <div className="flex h-[60px] items-center justify-between bg-gray-200 px-[32px]">
        <StudiesPagination count={count} intervalSize={intervalSize} current={current} onChange={setCurrent} />
      </div>
    </div>
  );
};

export default ProjectContent;
