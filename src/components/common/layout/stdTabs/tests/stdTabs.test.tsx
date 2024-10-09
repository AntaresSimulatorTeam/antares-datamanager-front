/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { generateFakeTabItems } from '@/mocks/data/components/tabs.mock';
import { tabsGenerator } from '@/shared/utils/common/generator/tabsGenerator';
import { render, screen } from '@testing-library/react';
import StdTabItem from '../StdTabItem';
import StdTabs from '../StdTabs';
import { ACTIVE_CLASSES, DISABLED_CLASSES } from '../tabClassBuilder';
import { buildSecondaryTabsState } from '../utils';

const TABS_GENERATOR_PARAMS_WITH_PRIMARY_ONLY = { primaryNumber: 10, secondaryNumber: 0 };
const TABS_GENERATOR_PARAMS_WITH_SECONDARY = { primaryNumber: 10, secondaryNumber: 15 };
const TEST_ID = 'tab-group';
const TAB_LABEL = 'tab-label';
const TAB_ID = 'tab-id';
const TAB_ID_SECONDARY = 'tab-id-secondary';
const noop = () => {};

describe('StdTabs', () => {
  it('renders StdTabs component with primary tablist only', () => {
    const items = tabsGenerator(TABS_GENERATOR_PARAMS_WITH_PRIMARY_ONLY);
    render(
      <StdTabs
        items={items}
        id={TEST_ID}
        renderPrimary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
      />,
    );
    const tabGroup = screen.getByRole('group');
    expect(tabGroup).toBeInTheDocument();
    expect(tabGroup.id).toBe(TEST_ID);
    expect(screen.getAllByRole('tablist').length).toBe(1);
    expect(screen.getAllByRole('tab').length).toBe(10);
  });

  it('renders StdTabs component with primary and secondary tablist', () => {
    const items = tabsGenerator(TABS_GENERATOR_PARAMS_WITH_SECONDARY);
    render(
      <StdTabs
        items={items}
        id={TEST_ID}
        renderPrimary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
        renderSecondary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
      />,
    );
    const tabGroup = screen.getByRole('group');
    expect(tabGroup).toBeInTheDocument();
    expect(tabGroup.id).toBe(TEST_ID);
    expect(screen.getAllByRole('tablist').length).toBe(2);
    expect(screen.getAllByRole('tab').length).toBe(25);
  });

  it('renders StdTabs component with primary tablist only with active', () => {
    const items = tabsGenerator(TABS_GENERATOR_PARAMS_WITH_PRIMARY_ONLY);
    items[3] = {
      ...items[3],
      id: TAB_ID,
      label: TAB_LABEL,
      active: true,
    };
    render(
      <StdTabs
        items={items}
        id={TEST_ID}
        renderPrimary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
      />,
    );
    const tabItems = screen.getAllByRole('tab');
    expect(tabItems.find((tab) => tab.id === TAB_ID)?.children[0].className.includes(ACTIVE_CLASSES.active)).toBe(true);
  });

  it('renders StdTabs component with primary and secondary tablist with active', () => {
    const items = tabsGenerator(TABS_GENERATOR_PARAMS_WITH_SECONDARY);
    items[3] = {
      ...items[3],
      id: TAB_ID,
      label: TAB_LABEL,
      active: true,
    };
    if (items[3].secondary && items[3].secondary[2]) {
      items[3].secondary[2] = {
        ...items[3].secondary[2],
        id: TAB_ID_SECONDARY,
        label: TAB_LABEL,
        active: true,
      };
    }

    render(
      <StdTabs
        items={items}
        id={TEST_ID}
        renderPrimary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
        renderSecondary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
      />,
    );
    const tabItems = screen.getAllByRole('tab');
    expect(tabItems.find((tab) => tab.id === TAB_ID)?.children[0].className.includes(ACTIVE_CLASSES.active)).toBe(true);
    expect(
      tabItems.find((tab) => tab.id === TAB_ID_SECONDARY)?.children[0].className.includes(ACTIVE_CLASSES.active),
    ).toBe(true);
  });

  it('renders StdTabs component with primary and secondary tablist without active (first default)', () => {
    const items = tabsGenerator(TABS_GENERATOR_PARAMS_WITH_SECONDARY);
    items[0] = {
      ...items[0],
      id: TAB_ID,
      name: TAB_ID,
      label: TAB_LABEL,
      active: true,
    };
    if (items[0] && items[0].secondary && items[0].secondary[0]) {
      items[0].secondary[0] = {
        ...items[0].secondary[0],
        id: TAB_ID_SECONDARY,
        name: TAB_ID_SECONDARY,
        label: TAB_LABEL,
        active: true,
      };
    }
    render(
      <StdTabs
        items={items}
        id={TEST_ID}
        renderPrimary={(item) => <StdTabItem key={item.name} id={item.id} {...item} onClick={noop} />}
        renderSecondary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
      />,
    );
    const tabItems = screen.getAllByRole('tab');
    expect(tabItems.find((tab) => tab.id === TAB_ID)?.children[0].className.includes(ACTIVE_CLASSES.active)).toBe(true);
    expect(
      tabItems.find((tab) => tab.id === TAB_ID_SECONDARY)?.children[0].className.includes(ACTIVE_CLASSES.active),
    ).toBe(true);
  });

  it('renders StdTabs component with primary tablist only with disabled', () => {
    const items = tabsGenerator(TABS_GENERATOR_PARAMS_WITH_PRIMARY_ONLY);
    items[3] = {
      ...items[3],
      id: TAB_ID,
      label: TAB_LABEL,
      disabled: true,
    };
    render(
      <StdTabs
        items={items}
        id={TEST_ID}
        renderPrimary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
        renderSecondary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
      />,
    );
    const tabItems = screen.getAllByRole('tab');
    expect(tabItems.find((tab) => tab.id === TAB_ID)?.children[0].className.includes(DISABLED_CLASSES)).toBe(true);
  });

  it('renders StdTabs component with primary and secondary tablist with disabled', () => {
    const items = tabsGenerator(TABS_GENERATOR_PARAMS_WITH_SECONDARY);
    items[3] = {
      ...items[3],
      id: TAB_ID,
      label: TAB_LABEL,
      active: true,
    };
    if (items[3].secondary && items[3].secondary[2]) {
      items[3].secondary[2] = {
        ...items[3].secondary[2],
        id: TAB_ID_SECONDARY,
        label: TAB_LABEL,
        disabled: true,
      };
    }

    render(
      <StdTabs
        items={items}
        id={TEST_ID}
        renderPrimary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
        renderSecondary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
      />,
    );
    const tabItems = screen.getAllByRole('tab');
    expect(tabItems.find((tab) => tab.id === TAB_ID_SECONDARY)?.children[0].className.includes(DISABLED_CLASSES)).toBe(
      true,
    );
  });

  it('renders StdTabs component with primary and secondary tablist with inactive classes', () => {
    const items = tabsGenerator(TABS_GENERATOR_PARAMS_WITH_SECONDARY);
    items[0] = {
      ...items[0],
      id: TAB_ID,
      label: TAB_LABEL,
    };
    if (items[0].secondary && items[0].secondary[0]) {
      items[0].secondary[0] = {
        ...items[0].secondary[0],
        id: TAB_ID_SECONDARY,
        label: TAB_LABEL,
      };
    }
    render(
      <StdTabs
        items={items}
        id={TEST_ID}
        renderPrimary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
        renderSecondary={(item) => <StdTabItem key={item.name} {...item} onClick={noop} />}
      />,
    );
    const tabItems = screen.getAllByRole('tab');
    expect(
      tabItems.every(
        (tab) =>
          ![TAB_ID, TAB_ID_SECONDARY].includes(tab.id) && tab.children[0].className.includes(ACTIVE_CLASSES.inactive),
      ),
    );
  });
});

describe('buildSecondaryTabsState function', () => {
  it('should return an empty object when input array is empty', () => {
    const result = buildSecondaryTabsState([]);
    expect(result).toEqual({});
  });

  it('should return an object with secondary tab states', () => {
    const result = buildSecondaryTabsState(generateFakeTabItems(5)[0]);
    expect(result).toEqual({ Tab1: 'SubTab1', Tab2: 'SubTab4' });
  });

  it('should return an object with default state when no secondary tabs are active', () => {
    const result = buildSecondaryTabsState(generateFakeTabItems(5)[1]);
    expect(result).toEqual({ Tab1: 'SubTab1', Tab2: undefined });
  });
});
