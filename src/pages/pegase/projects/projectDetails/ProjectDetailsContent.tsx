/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdIconButton from '@/components/common/base/stdIconButton/StdIconButton';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';

type ProjectDetailsContentProps = {
  description: string;
  creationDate: Date;
  createdBy: string;
};

export const ProjectDetailsContent = ({ description, creationDate, createdBy }: ProjectDetailsContentProps) => {
  const handleEditClick = () => {
    console.log('TO BE DONE');
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="group flex flex-col gap-3 rounded bg-primary-100 p-2" role="banner">
        <div className="text-base justify-between text-left font-sans font-normal text-gray-900">{description}</div>

        <div className="flex items-center justify-between font-sans font-light text-gray-500">
          <div className="flex items-center gap-3">
            <span>{formatDateToDDMMYYYY(creationDate)}</span>
            <span>{createdBy}</span>
          </div>

          <StdIconButton icon={StdIconId.Edit} size="small" onClick={handleEditClick} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsContent;
