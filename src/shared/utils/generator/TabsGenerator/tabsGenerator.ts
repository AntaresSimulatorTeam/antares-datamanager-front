import { StdTabItemProps } from '@/components/common/layout/stdTabs/StdTabItem';

export type TabsGeneratorParams = {
  primaryNumber: number;
  secondaryNumber: number;
};

export const tabsGenerator = (tabGenerator: TabsGeneratorParams): Omit<StdTabItemProps, 'onClick'>[] => {
  const tabs: Omit<StdTabItemProps, 'onClick' | 'tabType'>[] = [];
  for (let primary = 1; primary <= (tabGenerator.primaryNumber ?? 10); primary++) {
    const primaryTab: Omit<StdTabItemProps, 'onClick' | 'tabType'> = {
      label: `Item ${primary}`,
      name: `item${primary}`,
      secondary: [],
    };
    if (tabGenerator.secondaryNumber) {
      const secondaryTabs: Omit<StdTabItemProps, 'onClick' | 'tabType'>[] = [];
      for (let secondary = 1; secondary <= (tabGenerator.secondaryNumber ?? 10); secondary++) {
        const secondaryTab: Omit<StdTabItemProps, 'onClick' | 'secondary'> = {
          label: `Item ${primary}.${secondary}`,
          name: `item${primary}.${secondary}`,
          tabType: 'secondary',
        };
        secondaryTabs.push(secondaryTab);
      }
      primaryTab.secondary = secondaryTabs;
    }
    tabs.push(primaryTab);
  }
  return tabs;
};
