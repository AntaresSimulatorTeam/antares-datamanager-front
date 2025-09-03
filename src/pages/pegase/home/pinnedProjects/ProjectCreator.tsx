/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal';
import StdButton from '@common/base/stdButton/StdButton';

export const ProjectCreator = () => {
  const { t } = useTranslation();
  const { isModalOpen, toggleModal } = useNewStudyModal();

  return (
    <div className="flex items-center justify-center border border-dashed border-primary-700 p-4">
      <StdButton label={t('home.@buttonNewProject')} variant="outlined" color="primary" onClick={toggleModal} />
      {isModalOpen && <ProjectCreationModal onClose={toggleModal} />}
    </div>
  );
};

export default ProjectCreator;
