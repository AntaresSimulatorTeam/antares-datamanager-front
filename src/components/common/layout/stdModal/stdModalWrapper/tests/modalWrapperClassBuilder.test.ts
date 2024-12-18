/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import modalWrapperClassBuilder, {
  CONTAINER_CLASSES,
  MODAL_CLASSES,
  SUB_CONTAINER_CLASSES,
} from '../modalClassBuilder';

describe('modalWrapperClassBuilder function', () => {
  it('should have common classes', () => {
    const classes = modalWrapperClassBuilder();
    expect(classes.containerClasses.includes(CONTAINER_CLASSES)).toBe(true);
    expect(classes.subContainerClasses.includes(SUB_CONTAINER_CLASSES)).toBe(true);
    expect(classes.modalClasses.includes(MODAL_CLASSES)).toBe(true);
  });
});
