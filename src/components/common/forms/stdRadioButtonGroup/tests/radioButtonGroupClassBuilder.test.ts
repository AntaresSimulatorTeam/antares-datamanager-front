/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import radioButtonGroupClassBuilder, {
  COMMON_FIELSET_CLASSES,
  DISABLED_TEXT_CLASSES,
  TEXT_COLOR_HELPER_ERROR_CLASSES,
} from '../radioButtonGroupClassBuilder';

describe('radioButtonGroupClassBuilder function', () => {
  it('should have the common fieldset classes', () => {
    expect(radioButtonGroupClassBuilder(false).fieldsetClasses.includes(COMMON_FIELSET_CLASSES)).toBe(true);
  });
  it('should have the disabled text classes', () => {
    expect(radioButtonGroupClassBuilder(false, true).textClasses.includes(DISABLED_TEXT_CLASSES)).toBe(true);
  });
  it('should have the variant helper text classes', () => {
    expect(radioButtonGroupClassBuilder(true).helperTextClasses.includes(TEXT_COLOR_HELPER_ERROR_CLASSES)).toBe(true);
  });
});
