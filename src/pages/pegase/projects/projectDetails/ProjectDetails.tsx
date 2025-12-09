/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectDetailsHeader from './ProjectDetailsHeader';
import StudyTableDisplay from '@/pages/pegase/home/components/StudyTableDisplay';
import SearchBar from '@/pages/pegase/home/components/SearchBar';
import { useTranslation } from 'react-i18next';
import { RdsChip, RdsDivider } from 'rte-design-system-react';
import DetailsContent from '@/components/banner/DetailsContent.tsx';
import { useUser } from '@/store/contexts/UserContext.tsx';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal.tsx';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { useGetProjectDetails } from '@/hooks/useGetProjectDetails.ts';

const ProjectDetails = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string | undefined>('');
  const [activeChip, setActiveChip] = useState<boolean | null>(false);
  const [reFetchProject, setReFetchProject] = useState(0);
  const { user } = useUser();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  const { id } = useParams();
  const { projectDetails } = useGetProjectDetails(id ?? null, reFetchProject);

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
    <div className="flex flex-col">
      <ProjectDetailsHeader projectName={projectDetails.name} />
      <RdsDivider />
      <div className="flex flex-col">
        <DetailsContent content={projectDetails} onClickButton={toggleModal} />
      </div>
      <div className="flex flex-col gap-4 p-3">
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
      {isModalOpen && <ProjectCreationModal onClose={onCloseModal} projectInfo={projectDetails} />}
    </div>
  );
};

export default ProjectDetails;
