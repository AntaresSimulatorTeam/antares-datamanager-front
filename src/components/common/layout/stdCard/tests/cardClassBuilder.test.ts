/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import cardClassBuilder, {
  ACTIVE_CARD_CLASSES,
  COMMON_CARD_CLASSES,
  DISABLED_CARD_CLASSES,
  FOCUS_CARD_CLASSES,
  HOVER_CARD_CLASSES,
  KEYBOARD_CARD_CLASSES,
} from '../cardClassBuilder';

describe('cardClassBuilder function', () => {
  it('should have the common classes', () => {
    expect(cardClassBuilder().cardClasses.includes(COMMON_CARD_CLASSES)).toBe(true);
  });

  it('should have the hover/active classes when the card is clickable', () => {
    expect(cardClassBuilder(true, false).cardClasses.includes(HOVER_CARD_CLASSES)).toBe(true);
    expect(cardClassBuilder(true, false).cardClasses.includes(ACTIVE_CARD_CLASSES)).toBe(true);
  });

  it('should have the active keyboard classes when the components when the "Space" key is pressed while the focus is on the card', () => {
    expect(cardClassBuilder(true, true).cardClasses.includes(KEYBOARD_CARD_CLASSES)).toBe(true);
  });

  it('should not have the hover/active keyboard classes when the "Space" key is not pressed', () => {
    expect(cardClassBuilder(false, false).cardClasses.includes(KEYBOARD_CARD_CLASSES)).toBe(false);
  });

  it('should not have the hover/active classes when a button is hovered', () => {
    expect(cardClassBuilder(false, false, true).cardClasses.includes(HOVER_CARD_CLASSES)).toBe(false);
    expect(cardClassBuilder(false, false, true).cardClasses.includes(ACTIVE_CARD_CLASSES)).toBe(false);
  });

  it('should have the disabled classes when disabled', () => {
    expect(cardClassBuilder(true, true, true).cardClasses.includes(DISABLED_CARD_CLASSES)).toBe(true);
  });

  it('should not have the hover/focus/active classes when disabled', () => {
    expect(cardClassBuilder(true, true, true).cardClasses.includes(HOVER_CARD_CLASSES)).toBe(false);
    expect(cardClassBuilder(true, true, true).cardClasses.includes(FOCUS_CARD_CLASSES)).toBe(false);
    expect(cardClassBuilder(true, true, true).cardClasses.includes(ACTIVE_CARD_CLASSES)).toBe(false);
  });
});
