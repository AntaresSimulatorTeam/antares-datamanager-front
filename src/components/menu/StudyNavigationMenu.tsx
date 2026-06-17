/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { StdTabItemProps, StudyDTO, WarningTrajectoryType } from '@/shared/types';
import { getStudyMenu } from '@/shared/utils/trajectoryUtils.ts';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { AreaLinkTab } from '@/components/tab/AreaLinkTab.tsx';
import { TabMenu } from '@/components/menu/TabMenu.tsx';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { ContainerWithExpander } from '@/components/banner/ContainerWithExpander.tsx';
import { useFetchWarningMessages } from '@/hooks/useFetchWarningMessages.ts';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar.tsx';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps.ts';
import { getNbMessagesFromTrajectoryType } from '@/shared/services/trajectoryService.ts';
import { countWarning } from '@/shared/utils/warningUtils.ts';

type StudyNavigationMenuProps = {
  studyData: StudyDTO;
};

const StudyNavigationMenu = ({ studyData }: StudyNavigationMenuProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [tabs, setTabs] = useState<StdTabItemProps[]>(
    getStudyMenu(t, !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]),
  );
  const [activeTab, setActiveTab] = useState<StdTabItemProps>({
    id: TRAJECTORY_TYPE.AREA,
    panelId: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: StdIconId.LinkedServices,
    disabled: false,
  });
  const { areaDefault, trajectoryAreas } = useFetchAreas(studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]);
  const { warningMessages } = useFetchWarningMessages(studyData.id ? Number(studyData.id) : null, activeTab?.id);
  const [warningTrajectory, setWarningTrajectory] = useState<WarningTrajectoryType>();

  useEffect(() => {
    const hasAreaTrajectory = !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0];
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        disabled: tab.id !== TRAJECTORY_TYPE.AREA && !hasAreaTrajectory,
      })),
    );
  }, [studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories]);

  useEffect(() => {
    const countNbWarningMessages = async (id: number) => {
      try {
        const result = await getNbMessagesFromTrajectoryType(id);
        setWarningTrajectory(result);
      } catch {
        // silent handler;
      }
    };
    void countNbWarningMessages(studyData?.id);
  }, [activeTab.id, studyData?.id]);

  const renderActiveComponent = useCallback(
    (type: TRAJECTORY_TYPE): ReactNode | null => {
      switch (type) {
        case TRAJECTORY_TYPE.LOAD:
        case TRAJECTORY_TYPE.DSR:
        case TRAJECTORY_TYPE.STS:
          return (
            <ExpandableTab
              tabType={type}
              types={[type]}
              defaultAreas={areaDefault}
              areas={trajectoryAreas}
              studyData={studyData}
            />
          );
        case TRAJECTORY_TYPE.THERMAL_CAPACITY:
        case TRAJECTORY_TYPE.MISC_CAPACITY:
        case TRAJECTORY_TYPE.RES_CAPACITY:
        case TRAJECTORY_TYPE.HYDRO_SERIES:
          return (
            <TabMenu key={type} type={type} defaultAreas={areaDefault} areas={trajectoryAreas} studyData={studyData} />
          );
        default:
          return <AreaLinkTab studyData={studyData} />;
      }
    },
    [areaDefault, studyData, trajectoryAreas],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex space-x-2">
        {tabs.map((tab) => {
          const nbWarning = warningTrajectory ? countWarning(warningTrajectory, tab.id) : 0;
          return (
            <div className="flex items-center space-x-2" key={tab.label}>
              {tab.label && (
                <StdTabItem
                  key={tab.label}
                  name={tab.label}
                  label={tab.label}
                  active={activeTab?.label === tab.label}
                  disabled={tab.disabled}
                  onClick={() => !tab.disabled && setActiveTab(tab)}
                  icon={tab.icon}
                />
              )}
              {nbWarning > 0 && activeTab.id !== tab.id && (
                <StdAvatar
                  initials={`${nbWarning}`}
                  size="es"
                  backgroundColor="orange"
                  fullname=""
                  textColor="white"
                  hasToolTip={false}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        <ContainerWithExpander content={warningMessages?.data ?? []} placeholder={t('studyDetails.@noWarnings')} />
        {!activeTab?.disabled && renderActiveComponent(activeTab?.id)}
      </div>
    </div>
  );
};

export default StudyNavigationMenu;
