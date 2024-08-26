/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { classMerger } from '@/shared/utils/common/classes/classMerger';

export const COMMON_TAG_LIST_CLASSES = 'flex h-full w-full items-center content-start flex-wrap gap-1';

export const tagListClassBuilder = (isReady: boolean) => ({
  tagListClasses: isReady ? COMMON_TAG_LIST_CLASSES : classMerger(COMMON_TAG_LIST_CLASSES, 'invisible'),
});
