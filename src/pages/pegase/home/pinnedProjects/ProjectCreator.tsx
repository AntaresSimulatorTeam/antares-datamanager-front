/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useNewStudyModal } from '@/hooks/useNewStudyModal.ts';
import { ProjectCreationModal } from '@common/modal/ProjectCreationModal';
import { Button } from '@design-system-rte/react';

export const ProjectCreator = () => {
  const { t } = useTranslation();
  const { isModalOpen, toggleModal } = useNewStudyModal();

  return (
    <div className="flex items-center justify-center border border-dashed border-primary-700 p-4">
      <Button icon="add" label={t('home.@buttonNewProject')} size="s" variant="secondary" onClick={toggleModal} />
      <ProjectCreationModal onClose={toggleModal} isOpen={isModalOpen} />
    </div>
  );
};

export default ProjectCreator;
