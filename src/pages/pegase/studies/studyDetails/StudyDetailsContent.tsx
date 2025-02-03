/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { StudyDTO } from '@/shared/types';
import { RdsIcon, RdsIconId, RdsTagList } from 'rte-design-system-react';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

type ProjectDetailsContentProps = {
  study: StudyDTO;
};

export const StudyDetailsContent = ({ study }: ProjectDetailsContentProps) => {
  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="group flex flex-col gap-3 rounded bg-primary-100 p-2" role="banner">
        <div className="flex items-center justify-between font-sans font-light text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex flex-[1_0_0] items-center gap-6">
              <div>Study : {study.name}</div>
              <div className="flex items-center gap-2">
                <StdIcon name={StdIconId.TimeLine} color="secondary" />
                Horizon : {study.horizon}
              </div>
              <div className="flex items-center gap-2">
                <RdsIcon name={RdsIconId.History} color="secondary" />
                {formatDateToDDMMYYYY(study.creationDate)}
              </div>
              <div className="flex items-center gap-2">
                <RdsIcon name={RdsIconId.Person} color="secondary" />
                By : {study.createdBy}
              </div>
              <div className="flex h-3 w-32">
                <RdsTagList id={`${study.id}-tag-list`} tags={study.keywords} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyDetailsContent;
