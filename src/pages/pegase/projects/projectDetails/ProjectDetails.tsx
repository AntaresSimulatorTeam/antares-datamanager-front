/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudyTableDisplay from '@/pages/pegase/home/components/StudyTableDisplay';
import SearchBar from '@/pages/pegase/home/components/SearchBar';
import { useTranslation } from 'react-i18next';
import { RdsChip, RdsDivider } from 'rte-design-system-react';
import DetailsContent from '@/components/banner/DetailsContent.tsx';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useGetProjectDetails } from '@/hooks/useGetProjectDetails.ts';
import { PegaseBreadcrumbItemType } from '@/shared/types';
import { PegaseBreadcrumb } from '@common/layout/PegaseBreadcrumb/PegaseBreadcrumb.tsx';

const ProjectDetails = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
  const [reFetchProject, setReFetchProject] = useState(0);
  const { user } = useUser();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { id } = useParams();
  const { projectDetails } = useGetProjectDetails(id ?? null, reFetchProject);
  const navigate = useNavigate();

  const headerItems: PegaseBreadcrumbItemType[] = [
    {
      key: 'item-0',
      label: 'Project',
      data: { id: '/projects' },
      onClickItem: navigate,
    },
    {
      key: 'item-1',
      label: projectDetails?.name ?? '',
      data: { id: projectDetails?.id ?? '', name: projectDetails?.name ?? '' },
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
    <div className="flex flex-col gap-4">
      <div className="px-3 pt-3">
        <PegaseBreadcrumb items={headerItems}></PegaseBreadcrumb>
      </div>
      <RdsDivider />
      <div className="flex flex-col gap-4 px-3 pb-3">
        <DetailsContent content={projectDetails} onClickButton={toggleModal} />
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <SearchBar onSearch={(value?: string) => setSearchTerm(value)} />
            <RdsChip
              label={t('home.@my_studies')}
              onClick={handleChipClick}
              status={activeChip ? 'secondary' : 'primary'}
            />
          </div>
          <StudyTableDisplay searchStudy={searchTerm} projectInfo={projectDetails} />
        </div>
      </div>
      {isModalOpen && <ProjectCreationModal onClose={onCloseModal} projectInfo={projectDetails} />}
    </div>
  );
};

export default ProjectDetails;
