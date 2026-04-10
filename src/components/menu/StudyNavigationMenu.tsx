/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { TRAJECTORY_TYPE } from '@/shared/enum/trajectory.ts';
import { useTranslation } from 'react-i18next';
import { useStudy } from '@/store/contexts/StudyContext.tsx';
import { HypothesisTab, StudyDTO, WarningTrajectoryType } from '@/shared/types';
import StdAvatar from '@common/layout/stdAvatar/StdAvatar.tsx';
import { getStudyMenu } from '@/shared/utils/trajectoryUtils.ts';
import { useFetchAreas } from '@/hooks/useFetchAreas.ts';
import { countWarning } from '@/shared/utils/warningUtils.ts';
import { getNbMessagesFromTrajectoryType } from '@/shared/services/trajectoryService.ts';
import StdTabItem from '@common/layout/stdTabs/StdTabItem.tsx';
import { AreaLinkTab } from '@/components/tab/AreaLinkTab.tsx';
import { TabMenu } from '@/components/menu/TabMenu.tsx';
import ExpandableTab from '@/components/tab/ExpandableTab.tsx';

type StudyNavigationMenuProps = {
  onRenderActiveComponent?: (content: ReactNode | null) => void;
  setActiveTab: Dispatch<SetStateAction<HypothesisTab>>;
  activeTab: HypothesisTab;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  studyData: StudyDTO;
};

const StudyNavigationMenu = ({
  onRenderActiveComponent,
  setActiveTab,
  activeTab,
  setErrorMessage,
  studyData,
}: StudyNavigationMenuProps) => {
  const { t } = useTranslation();
  const studyState = useStudy();
  const [tabs, setTabs] = useState<HypothesisTab[]>(
    getStudyMenu(t, !!studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]),
  );
  const [warningTrajectory, setWarningTrajectory] = useState<WarningTrajectoryType>();
  const { areaDefault, trajectoryAreas } = useFetchAreas(studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0]);

  const renderActiveComponent = (type: TRAJECTORY_TYPE): ReactNode | null => {
    switch (type) {
      case TRAJECTORY_TYPE.LOAD:
      case TRAJECTORY_TYPE.DSR:
      case TRAJECTORY_TYPE.STS:
        return <ExpandableTab type={type} defaultAreas={areaDefault} areas={trajectoryAreas} studyData={studyData} />;
      case TRAJECTORY_TYPE.THERMAL_CAPACITY:
      case TRAJECTORY_TYPE.MISC_CAPACITY:
      case TRAJECTORY_TYPE.RES_CAPACITY:
        return <TabMenu type={type} defaultAreas={areaDefault} areas={trajectoryAreas} studyData={studyData} />;
      default:
        return <AreaLinkTab setErrorMessage={setErrorMessage} studyData={studyData} />;
    }
  };

  useEffect(() => {
    setTabs((prev) =>
      prev.map((tab) => ({
        ...tab,
        isDisabled: tab.name !== TRAJECTORY_TYPE.AREA && !studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories?.[0],
      })),
    );
  }, [studyState[`${TRAJECTORY_TYPE.AREA}`]?.trajectories]);

  useEffect(() => {
    const countNbWarningMessages = async (id: number) => {
      try {
        const result = await getNbMessagesFromTrajectoryType(id);
        setWarningTrajectory(result);
      } catch {
        // silent handler
      }
    };
    if (onRenderActiveComponent) {
      if (!activeTab.isDisabled) {
        setErrorMessage('');
        onRenderActiveComponent(renderActiveComponent(activeTab.name));
      }
    }
    void countNbWarningMessages(studyData?.id);
  }, [activeTab, onRenderActiveComponent, studyData?.id, studyState]);

  return (
    <div className="flex space-x-4 p-4">
      {tabs.map((tab) => {
        const nbWarning = warningTrajectory ? countWarning(warningTrajectory, tab.name) : 0;
        return (
          <div className="flex items-center space-x-2" key={tab.name}>
            <StdTabItem
              key={tab.name}
              name={tab.name}
              label={tab.label}
              active={activeTab.name === tab.name}
              disabled={tab.isDisabled}
              onClick={() => !tab.isDisabled && setActiveTab(tab)}
              icon={tab.icon}
            />
            {nbWarning > 0 && activeTab.name !== tab.name && (
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
  );
};

export default StudyNavigationMenu;
