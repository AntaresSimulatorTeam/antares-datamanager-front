/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdIconButton from '@/components/common/base/stdIconButton/StdIconButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useTranslation } from 'react-i18next';

type ProjectDetailsContentProps = {
  description: string;
  creationDate: Date;
  createdBy: string;
};

export const ProjectDetailsContent = ({ description, creationDate, createdBy }: ProjectDetailsContentProps) => {
  const { t } = useTranslation();
  const formattedDate = t('date.format', { date: creationDate });

  const handleEditClick = () => {
    console.log('TO BE DONE');
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="group flex flex-col gap-3 rounded bg-primary-100 p-2" role="banner">
        <div className="text-sm justify-between text-left text-gray-700">{description}</div>

        <div className="text-sm flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-3">
            <span>{formattedDate}</span>
            <span>{createdBy}</span>
          </div>

          <StdIconButton icon={StdIconId.Edit} size="small" onClick={handleEditClick} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsContent;
