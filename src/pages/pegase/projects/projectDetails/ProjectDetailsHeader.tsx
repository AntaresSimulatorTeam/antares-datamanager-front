/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdButton from '@/components/common/base/stdButton/StdButton';
import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import StdHeading from '@/components/common/layout/stdHeading/StdHeading';
import { useTranslation } from 'react-i18next';

type ProjectDetailsHeaderProps = {
  projectName: string;
  createdBy: string;
};

const ProjectDetailsHeader = ({ projectName, createdBy }: ProjectDetailsHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <StdHeading title={projectName} />
      <div className="ml-auto flex items-center gap-4">
        <StdButton label={t('home.@buttonNewProject')} variant="contained" color="primary" />
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
