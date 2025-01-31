/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import { ProjectCreationModal } from '@/components/common/modal/ProjectCreationModal';
import { useNewStudyModal } from '@/hooks/useNewStudyModal';
import { useTranslation } from 'react-i18next';
import { RdsButton, RdsHeading } from 'rte-design-system-react';

type ProjectDetailsHeaderProps = {
  projectName: string;
  createdBy: string;
};

const ProjectDetailsHeader = ({ projectName, createdBy }: ProjectDetailsHeaderProps) => {
  const { t } = useTranslation();
  const { isModalOpen, toggleModal } = useNewStudyModal();
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <RdsHeading title={projectName} />
      <div className="ml-auto flex items-center gap-4">
        <RdsButton label={t('home.@buttonNewProject')} variant="contained" color="primary" onClick={toggleModal} />
        {isModalOpen && <ProjectCreationModal onClose={toggleModal} />}
        <StdAvatar
          size="s"
          backgroundColor="green"
          fullname={createdBy}
          initials={createdBy.substring(0, 2)}
        ></StdAvatar>
      </div>
    </div>
  );
};

export default ProjectDetailsHeader;
