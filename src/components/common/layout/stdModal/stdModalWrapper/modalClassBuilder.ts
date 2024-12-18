/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const CONTAINER_CLASSES =
  'fixed left-0 top-0 z-50 flex h-full w-full items-start justify-center overflow-auto bg-gray-900/25';

export const SUB_CONTAINER_CLASSES = 'flex min-h-full min-w-full items-center justify-center p-2';

export const MODAL_CLASSES = 'rounded bg-gray-w shadow-4 overflow-auto';

export default function modalWrapperClassBuilder() {
  return {
    containerClasses: CONTAINER_CLASSES,
    subContainerClasses: SUB_CONTAINER_CLASSES,
    modalClasses: MODAL_CLASSES,
  };
}
