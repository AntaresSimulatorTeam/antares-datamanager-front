/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ProjectInfo } from '@/shared/types/pegase/Project.type';
import PegaseCard from '@/components/pegase/pegaseCard/pegaseCard';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdTagList from '@common/base/StdTagList/StdTagList';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar';
import { formatDateToDDMMYYYY } from '@/shared/utils/dateFormatter';
import { useProjectDropdown } from '@/components/pegase/pegaseCard/useProjectDropdown';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const PinnedProjectCards = () => {
  const BASE_URL = import.meta.env.VITE_BACK_END_BASE_URL;
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const dropdownItems = useProjectDropdown();
  const { t } = useTranslation();
  // const user = useContext(UserContext);
  //const userId = user?.profile.nni ? user.profile.nni : 'mo0023';
  useEffect(() => {
    fetch(BASE_URL + `/v1/project/pinned?userId=me00247`)
      .then((response) => response.json())
      .then((json) => {
        setProjects(json);
      })
      .catch((error) => console.error(error));
  }, []);

  return projects.map((project) => (
    <div className="flex w-1/3">
      <PegaseCard
        title={project.name}
        dropdownOptions={dropdownItems}
        id="1"
        icons={
          <div className="text-primary-600">
            <StdIcon name={StdIconId.PushPin} />{' '}
          </div>
        }
      >
        <div className="flex flex-col items-start justify-between">
          <div className="flex items-center gap-1">
            {project.tags && (
              <div className="flex h-3 w-full">
                <StdTagList id={`${project.projectId}-tag-list`} tags={project.tags} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-x-0.5 pt-2.5">
            <div className="font-sans text-body-xs font-light">
              {t('project.@created')} :{' '}
              <span className="text-body-xs font-bold">{formatDateToDDMMYYYY(project.creationDate)} </span>{' '}
              {t('project.@by')} :
            </div>

            <StdAvatar
              size="es"
              backgroundColor="gray"
              fullname={project.createdBy}
              initials={project.createdBy.substring(0, 2)}
            />
            <span className="font-sans text-body-xs font-light">{project.createdBy}</span>
          </div>
        </div>
      </PegaseCard>
    </div>
  ));
};

export default PinnedProjectCards;
