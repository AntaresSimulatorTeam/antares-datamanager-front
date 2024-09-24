/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AvatarColor, AvatarSize } from '../StdAvatar';
import { AVATAR_CLASSES, AVATAR_SIZE_CLASSES, COLOR_CLASSES, avatarClassBuilder } from '../avatarClassBuilder';

describe('avatarClassBuilder', () => {
  it('should always include the avatar classes', () => {
    (Object.keys(AVATAR_SIZE_CLASSES) as AvatarSize[]).forEach((size) => {
      (Object.keys(COLOR_CLASSES) as AvatarColor[]).forEach((color) => {
        expect(avatarClassBuilder(size, color).includes(AVATAR_CLASSES)).toBe(true);
      });
    });
  });
  it('should always include the size classes', () => {
    (Object.keys(AVATAR_SIZE_CLASSES) as AvatarSize[]).forEach((size) => {
      (Object.keys(COLOR_CLASSES) as AvatarColor[]).forEach((color) => {
        expect(avatarClassBuilder(size, color).includes(AVATAR_SIZE_CLASSES[size])).toBe(true);
      });
    });
  });

  it('should always include the background color classes', () => {
    (Object.keys(AVATAR_SIZE_CLASSES) as AvatarSize[]).forEach((size) => {
      (Object.keys(COLOR_CLASSES) as AvatarColor[]).forEach((color) => {
        expect(avatarClassBuilder(size, color).includes(COLOR_CLASSES[color])).toBe(true);
      });
    });
  });
});
