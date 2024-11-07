/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { noop } from '@/shared/utils/common/defaultUtils';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';

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

export const fakeDropdownShortListWithIcons = [
  {
    id: 'item-1',
    key: 'item-1',
    label: 'Add',
    value: 'option-1',
    icon: StdIconId.Add,
    onItemClick: noop,
  },
  {
    id: 'item-2',
    key: 'item-2',
    label: 'Edit',
    value: 'option-2',
    icon: StdIconId.Edit,
    onItemClick: noop,
  },
  {
    id: 'item-3',
    key: 'item-3',
    label: 'Delete',
    value: 'option-3',
    icon: StdIconId.Delete,
    onItemClick: noop,
  },
];

export const fakeDropdownLongList = [
  {
    key: 'label-1',
    label: 'Label 1',
    value: 'Value1',
    icon: StdIconId.Apps,
    onItemClick: noop,
  },
  {
    key: 'label-2',
    label: 'Label 2',
    value: 'Value2',
    icon: StdIconId.AccountTree,
    onItemClick: noop,
  },
  {
    key: 'label-3',
    label: 'Label 3',
    value: 'Value3',
    icon: StdIconId.AccountTree,
    onItemClick: noop,
  },
  {
    key: 'label-4',
    label: 'Label 4',
    value: 'Value4',
    icon: StdIconId.AccountTree,
    onItemClick: noop,
  },
  {
    key: 'label-5',
    label: 'Label 5',
    value: 'Value5',
    icon: StdIconId.AccountTree,
    onItemClick: noop,
  },
  {
    key: 'label-6',
    label: 'Label 6',
    value: 'Value6',
    icon: StdIconId.AccountTree,
    onItemClick: noop,
  },
  {
    key: 'label-7',
    label: 'Label 7',
    value: 'Value7',
    icon: StdIconId.AccountTree,
    onItemClick: noop,
  },
];
