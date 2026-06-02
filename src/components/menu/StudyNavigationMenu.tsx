/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { StudyDTO } from '@/shared/types';
import { getStudyMenu } from '@/shared/utils/trajectoryUtils.ts';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { AreaLinkTab } from '@/components/tab/AreaLinkTab.tsx';
import { TabMenu } from '@/components/menu/TabMenu.tsx';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';
import { Tab } from '@design-system-rte/react';
import { TabItemProps } from '@design-system-rte/core/components/tab/tab.interface';
import { ContainerWithExpander } from '@/components/banner/ContainerWithExpander.tsx';
import { useFetchWarningMessages } from '@/hooks/useFetchWarningMessages.ts';

type StudyNavigationMenuProps = {
  setErrorMessage: Dispatch<SetStateAction<string>>;
  studyData: StudyDTO;
};

const StudyNavigationMenu = ({ setErrorMessage, studyData }: StudyNavigationMenuProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [tabs, setTabs] = useState<TabItemProps[]>(
    getStudyMenu(t, !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]),
  );
  const [activeTab, setActiveTab] = useState<TabItemProps>({
    id: TRAJECTORY_TYPE.AREA,
    panelId: TRAJECTORY_TYPE.AREA,
    label: t('studyDetails.@areas_links'),
    icon: 'share',
    disabled: false,
  });
  const [activeContent, setActiveContent] = useState<ReactNode>(null);

  const { areaDefault, trajectoryAreas } = useFetchAreas(studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]);
  const { warningMessages } = useFetchWarningMessages(
    studyData.id ? Number(studyData.id) : null,
    activeTab.id as TRAJECTORY_TYPE,
  );

  useEffect(() => {
    const hasAreaTrajectory = !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0];
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        disabled: tab.id !== (TRAJECTORY_TYPE.AREA as string) && !hasAreaTrajectory,
      })),
    );
  }, [studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories]);

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
          return <TabMenu type={type} defaultAreas={areaDefault} areas={trajectoryAreas} studyData={studyData} />;
        default:
          return <AreaLinkTab setErrorMessage={setErrorMessage} studyData={studyData} />;
      }
    },
    [areaDefault, setErrorMessage, studyData, trajectoryAreas],
  );

  useEffect(() => {
    if (!activeTab.disabled) {
      setErrorMessage('');
      setActiveContent(renderActiveComponent(activeTab.id as TRAJECTORY_TYPE));
    }
  }, []);

  useEffect(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        let nbWarning =
          warningMessages?.filter((message) => message.trajectoryType === (tab.id as TRAJECTORY_TYPE)).length ?? 0;
        if ((tab.id as TRAJECTORY_TYPE) === TRAJECTORY_TYPE.AREA) {
          nbWarning += warningMessages?.filter((message) => message.trajectoryType === TRAJECTORY_TYPE.LINK)?.length ?? 0;
        }

        if (activeTab.id === tab.id) {
          const { badgeCount: _removed, ...rest } = tab;
          return rest;
        }
        if (nbWarning > 0) {
          return { ...tab, badgeCount: nbWarning };
        }
        return tab;
      }),
    );
  }, [activeTab.id, warningMessages]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <Tab
        onChange={(id) => {
          const tabId = tabs.find((tab) => tab.id === id);
          if (tabId) {
            setActiveTab(tabId);
            if (!tabId.disabled) {
              setErrorMessage('');
              setActiveContent(renderActiveComponent(tabId.id as TRAJECTORY_TYPE));
            }
          }
        }}
        direction="horizontal"
        alignment="start"
        overflowType="dropdown"
        selectedTabId={activeTab.id}
        inverted={false}
        options={tabs}
      />
      <ContainerWithExpander content={warningMessages} placeholder={t('studyDetails.@noWarnings')} />
      <div className="flex min-h-0 flex-1">{activeContent}</div>
    </div>
  );
};

export default StudyNavigationMenu;
