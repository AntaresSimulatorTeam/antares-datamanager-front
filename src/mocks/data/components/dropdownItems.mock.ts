/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { noop } from '@/shared/utils/common/defaultUtils';
import { AnchorDefaultAsType } from '@common/base/element.type.ts';

export const fakeDropdownShortList = [
  {
    id: 'item-1',
    key: 'item-1',
    label: 'Option 1',
    value: 'option-1',
    onItemClick: noop,
  },
  {
    id: 'item-2',
    key: 'item-2',
    label: 'Option 2',
    value: 'option-2',
    onItemClick: noop,
  },
  {
    id: 'item-3',
    key: 'item-3',
    label: 'Option 3',
    value: 'option-3',
    onItemClick: noop,
  },
];

export const fakeDropdownWithCustomElement = [
  {
    id: 'item-1',
    key: 'item-1',
    label: 'Option 1',
    value: 'option-1',
    onItemClick: noop,
    as: AnchorDefaultAsType,
    role: 'link',
    name: 'no',
  },
  {
    id: 'item-2',
    key: 'item-2',
    label: 'Option 2',
    value: 'option-2',
    onItemClick: noop,
    as: AnchorDefaultAsType,
    role: 'link',
  },
];
