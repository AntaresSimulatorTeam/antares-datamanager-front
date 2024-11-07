/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import cardTitleClassBuilder, {
  CLICKABLE_TITLE_CLASSES,
  COMMON_TITLE_CLASSES,
  getLineClamp,
} from '../cardTitleClassBuilder';

describe('cardTitleClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(cardTitleClassBuilder().titleClasses.includes(COMMON_TITLE_CLASSES)).toBe(true);
  });

  it('should have the title click classes', () => {
    expect(cardTitleClassBuilder(undefined, true).titleClasses.includes(CLICKABLE_TITLE_CLASSES)).toBe(true);
  });

  it('should have the right line-clamp class', () => {
    const TEST_LINE_CLAMP = 4;
    expect(cardTitleClassBuilder(TEST_LINE_CLAMP).titleClasses.includes(getLineClamp(TEST_LINE_CLAMP))).toBe(true);
  });

  it('should have the default line-clamp class', () => {
    const TEST_LINE_CLAMP = undefined;
    expect(cardTitleClassBuilder(TEST_LINE_CLAMP).titleClasses.includes('line-clamp-1')).toBe(true);
  });
});
