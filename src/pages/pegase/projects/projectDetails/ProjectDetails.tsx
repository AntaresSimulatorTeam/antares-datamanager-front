/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import StudyTableDisplay from '@/pages/pegase/home/components/StudyTableDisplay';
import { useTranslation } from 'react-i18next';
import DetailsContent from '@/components/banner/DetailsContent.tsx';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useGetProjectDetails } from '@/hooks/useGetProjectDetails.ts';
import { Breadcrumbs, Chip, Divider, Searchbar } from '@design-system-rte/react';
import { BreadcrumbItemProps } from '@design-system-rte/core/components/breadcrumbs/breadcrumbs.interface';

const ProjectDetails = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const [activeChip, setActiveChip] = useState<boolean>(false);
  const [reFetchProject, setReFetchProject] = useState(0);
  const { user } = useUser();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { id } = useParams();
  const { projectDetails } = useGetProjectDetails(id != null ? Number(id) : null, reFetchProject);

  const headerItems: BreadcrumbItemProps[] = [
    {
      label: 'Project',
      link: '/projects',
    },
    {
      label: projectDetails?.name ?? '',
      link: `${projectDetails?.id ?? ''}`,
    },
  ];

  const handleChipClick = () => {
    if (activeChip) {
      setActiveChip(false);
      setSearchTerm('');
    } else {
      setActiveChip(true);
      setSearchTerm(user?.profile.sub);
    }
  };

  const onCloseModal = () => {
    toggleModal();
    setReFetchProject((prev) => prev + 1);
  };

  return !projectDetails.id ? (
    <div className="flex h-screen items-center justify-center">
      <p>{t('projectDetails.@loading')}</p>
    </div>
  ) : (
    <div className="flex flex-col items-start gap-4 p-3">
      <Breadcrumbs items={headerItems}></Breadcrumbs>
      <Divider />
      <DetailsContent content={projectDetails} onClickButton={toggleModal} tagsList={projectDetails.tags} />
      <div className="flex w-2/5 items-center gap-4">
        <div className="flex w-3/4">
          <Searchbar
            onSearch={(value?: string) => setSearchTerm(value)}
            onChange={(value?: string) => setSearchTerm(value)}
            label={t('home.@search_placeholder_study')}
          />
        </div>
        <div className="flex w-1/4">
          <Chip
            id="chip-project-details"
            label={t('home.@my_studies')}
            onClick={handleChipClick}
            selected={activeChip}
          />
        </div>
      </div>
      <StudyTableDisplay searchStudy={searchTerm} projectInfo={projectDetails} />
      {isModalOpen && <ProjectCreationModal onClose={onCloseModal} projectInfo={projectDetails} />}
    </div>
  );
};

export default ProjectDetails;
