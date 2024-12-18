/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const CONTAINER_CLASSES = 'flex min-w-full max-w-fit flex-col gap-2 self-end px-2 pb-2';

export const CHILDREN_CLASSES = 'flex flex-wrap justify-end gap-2';

export const INFO_CLASSES = 'flex items-center justify-end gap-1 text-caption text-gray-600';

export default function modalFooterClassBuilder() {
  return {
    containerClasses: CONTAINER_CLASSES,
    childrenClasses: CHILDREN_CLASSES,
    infoClasses: INFO_CLASSES,
  };
}
