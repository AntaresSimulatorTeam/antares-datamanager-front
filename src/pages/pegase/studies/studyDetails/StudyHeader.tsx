/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RdsIcon, RdsIconId } from 'rte-design-system-react';
import { PegaseBreadcrumb } from '@common/layout/PegaseBreadcrumb/PegaseBreadcrumb.tsx';
import { PegaseBreadcrumbItemType, StudyDTO } from '@/shared/types';
import { useProjectNavigation } from '@/hooks/useProjectNavigation.ts';

type StudyDetailsHeaderProps = {
  study: StudyDTO;
};

const StudyHeader = ({ study }: StudyDetailsHeaderProps) => {
  const { navigateToProject } = useProjectNavigation();
  const itemsStudyHeader: PegaseBreadcrumbItemType[] = [
    {
      key: 'item-0',
      label: study.project,
      data: { id: study.projectId, name: study.project },
      onClickItem: navigateToProject,
    },
    {
      key: 'item-1',
      label: study.name,
      data: null,
      onClickItem: navigateToProject,
    },
  ];

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="font-nunito text-base flex items-center gap-2 py-1 font-semibold leading-none">
        <RdsIcon name={RdsIconId.MoreHoriz} color="secondary" />
        <RdsIcon name={RdsIconId.KeyboardArrowRight} color="secondary" />
        <PegaseBreadcrumb items={itemsStudyHeader}></PegaseBreadcrumb>
      </div>
    </div>
  );
};

export default StudyHeader;
