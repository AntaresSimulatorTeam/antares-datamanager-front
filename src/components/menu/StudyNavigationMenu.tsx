/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { StudyDTO } from '@/shared/types';
import { getStudyMenu } from '@/shared/utils/trajectoryUtils.ts';
import { AreaLinkTab } from '@/components/tab/AreaLinkTab.tsx';
import { TabMenu } from '@/components/menu/TabMenu.tsx';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { ContainerWithExpander } from '@/components/banner/ContainerWithExpander.tsx';
import { useFetchWarningMessages } from '@/hooks/useFetchWarningMessages.ts';
import { getNbMessagesFromTrajectoryType } from '@/shared/services/trajectoryService.ts';
import { Tab } from '@design-system-rte/react';
import { TabItemProps } from '@design-system-rte/core/components/tab/tab.interface';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';

type StudyNavigationMenuProps = {
  studyData: StudyDTO;
};

const StudyNavigationMenu = ({ studyData }: StudyNavigationMenuProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [tabs, setTabs] = useState<TabItemProps[]>(
    getStudyMenu(t, !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]),
  );
  const [activeTab, setActiveTab] = useState<TabItemProps>({
    id: TRAJECTORY_TYPE.AREA,
    panelId: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: "linked-services",
    disabled: false,
  });
  const { warningMessages } = useFetchWarningMessages(
    studyData.id ? Number(studyData.id) : null,
    activeTab?.id as TRAJECTORY_TYPE,
  );

  const { areasDefault, trajectoryAreas, isFlowbasedAllowed } = useFetchAreas(activeTab?.id as TRAJECTORY_TYPE, studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]);

  useEffect(() => {
    const hasAreaTrajectory = !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0];
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        disabled: tab.id !== (TRAJECTORY_TYPE.AREA as string) && !hasAreaTrajectory,
      })),
    );
  }, [studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]]);

  useEffect(() => {
    const countNbWarningMessages = async (id: number) => {
      try {
        const result = await getNbMessagesFromTrajectoryType(id);
        setTabs((prev) =>
          prev.map((tab) => {
            if (activeTab.id === tab.id) {
              const { badgeCount: _removed, ...rest } = tab;
              return rest;
            }
            const nbWarnings =
              tab.id === (TRAJECTORY_TYPE.AREA as string)
                ? [TRAJECTORY_TYPE.AREA, TRAJECTORY_TYPE.LINK].reduce((acc, type) => acc + result[type], 0)
                : result[tab.id as TRAJECTORY_TYPE];
            if (nbWarnings > 0) {
              return { ...tab, badgeCount: nbWarnings };
            }
            return tab;
          }),
        );
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
              studyData={studyData}
              defaultAreas={areasDefault}
              areas={trajectoryAreas}
            />
          );
        case TRAJECTORY_TYPE.THERMAL_CAPACITY:
        case TRAJECTORY_TYPE.MISC_CAPACITY:
        case TRAJECTORY_TYPE.RES_CAPACITY:
        case TRAJECTORY_TYPE.HYDRO_SERIES:
          return (
            <TabMenu key={type} type={type} defaultAreas={areasDefault} areas={trajectoryAreas} studyData={studyData} />
          );
        default:
          return <AreaLinkTab studyData={studyData}/>;
      }
    },
    [areasDefault, isFlowbasedAllowed, studyData, trajectoryAreas],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Tab
        onChange={(id) => {
          const tabId = tabs.find((tab) => tab.id === id);
          if (tabId) {
            setActiveTab(tabId);
          }
        }}
        direction="horizontal"
        alignment="start"
        overflowType="scrollable"
        selectedTabId={activeTab.id}
        inverted={false}
        options={tabs}
      />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        <ContainerWithExpander content={warningMessages?.data ?? []} placeholder={t('studyDetails.@noWarnings')} />
        {!activeTab?.disabled && renderActiveComponent(activeTab?.id as TRAJECTORY_TYPE)}
      </div>
    </div>
  );
};

export default StudyNavigationMenu;
