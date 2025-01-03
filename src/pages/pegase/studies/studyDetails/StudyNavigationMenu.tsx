import React, {useEffect, useState} from 'react';
import {RdsTabItem} from 'rte-design-system-react';
import {StdIconId} from "@/shared/utils/common/mappings/iconMaps";
import LoadTab from "@/pages/pegase/studies/studyDetails/LoadTab";
import ThermalTab from "@/pages/pegase/studies/studyDetails/ThermalTab";
import EnrTab from "@/pages/pegase/studies/studyDetails/EnrTab";
import MiscTab from "@/pages/pegase/studies/studyDetails/MiscLinkTab";
import AreaLinkTab from "@/pages/pegase/studies/studyDetails/AreaLinkTab";
import StdIcon from "@common/base/stdIcon/StdIcon";

const StudyNavigationMenu = ({onRenderActiveComponent}: { onRenderActiveComponent?: (content: React.ReactNode) => void }) => {
    const [activeTab, setActiveTab] = useState<string>('areasAndLinks');

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'areasAndLinks':
                return <AreaLinkTab/>;
            case 'load':
                return <LoadTab/>;
            case 'thermal':
                return <ThermalTab/>;
            case 'enr':
                return <EnrTab/>;
            case 'misc':
                return <MiscTab/>;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (onRenderActiveComponent) {
            onRenderActiveComponent(renderActiveComponent());
        }
    }, [activeTab, onRenderActiveComponent]);

    const handleTabClick = (selectedItemName: string) => {
        setActiveTab(selectedItemName);
        console.log(`Tab clicked: ${selectedItemName}`);
    };

    const tabs = [
        {name: 'areasAndLinks', label: 'Areas & Links', icon: StdIconId.LinkedServices},
        {name: 'load', label: 'Load', icon: StdIconId.BatteryChargingFull},
        {name: 'thermal', label: 'Thermal', icon: StdIconId.LocalFireDepartment},
        {name: 'enr', label: 'ENR', icon: StdIconId.EnergySavingsLeaf},
        {name: 'misc', label: 'Misc', icon: StdIconId.Category},
    ];

    return (
        <div>
            <div className="flex space-x-4 p-4">
                {tabs.map((tab) => (
                    <div  className="flex items-center space-x-2">
                        <StdIcon name={tab.icon} />
                        <RdsTabItem
                            key={tab.name}
                            name={tab.name}
                            label={tab.label}
                            active={activeTab === tab.name}
                            onClick={() => handleTabClick(tab.name)}
                        />
                    </div>

                ))}
            </div>
        </div>
    );
};

export default StudyNavigationMenu;