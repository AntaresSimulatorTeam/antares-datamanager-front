/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import modalFooterClassBuilder, { CHILDREN_CLASSES, CONTAINER_CLASSES, INFO_CLASSES } from '../modalFooterClassBuilder';

describe('modalFooterClassBuilder function', () => {
  it('should have the common classes', () => {
    const classes = modalFooterClassBuilder();
    expect(classes.containerClasses.includes(CONTAINER_CLASSES)).toBe(true);
    expect(classes.childrenClasses.includes(CHILDREN_CLASSES)).toBe(true);
    expect(classes.infoClasses.includes(INFO_CLASSES)).toBe(true);
  });
});
