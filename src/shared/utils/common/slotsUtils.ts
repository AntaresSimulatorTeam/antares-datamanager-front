/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { ReactElement, FunctionComponent, Children } from 'react';

export const findSlotOfType = <T>(children: React.ReactNode, slotType: FunctionComponent<T>): ReactElement | null =>
  Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === slotType,
  ) as ReactElement | null;
