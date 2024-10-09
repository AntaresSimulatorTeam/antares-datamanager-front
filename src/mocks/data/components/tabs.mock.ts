/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdTabItemProps } from '@/components/common/layout/stdTabs/StdTabItem';

export const generateFakeTabItems = (seed = 1): Omit<StdTabItemProps, 'onClick' | 'tabType'>[][] => [
  [
    {
      name: 'Tab1',
      secondary: [
        { name: 'SubTab1', active: seed % 2 === 1 },
        { name: 'SubTab2', active: seed % 3 === 1 },
      ],
    },
    {
      name: 'Tab2',
      secondary: [
        { name: 'SubTab3', active: seed % 3 === 1 },
        { name: 'SubTab4', active: seed % 2 === 1 },
      ],
    },
  ],
  [
    {
      name: 'Tab1',
      secondary: [
        { name: 'SubTab1', active: seed % 3 === 1 },
        { name: 'SubTab2', active: seed % 3 === 1 },
      ],
    },
    { name: 'Tab2', secondary: [] },
  ],
];
