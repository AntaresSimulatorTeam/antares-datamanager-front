/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from "@/shared/utils/common/classes/classMerger";

export const DIVIDER_COMMON_CLASSES = 'border-t-1 w-full border-gray-300';

export const dividerClassBuilder = (extraClasses?: string) =>
  extraClasses ? classMerger(DIVIDER_COMMON_CLASSES, extraClasses) : DIVIDER_COMMON_CLASSES;
