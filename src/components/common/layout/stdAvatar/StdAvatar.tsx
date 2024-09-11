/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdTextTooltip from '../stdTextTooltip/StdTextTooltip';
import { avatarClassBuilder } from './avatarClassBuilder';
import { AVATAR_COLORS } from '../stdAvatarGroup/avatarTools';
import { useStdId } from '@/hooks/common/useStdId';

type StdAvatarProps = {
  initials: string;
  size: AvatarSize;
  backgroundColor: AvatarColor;
  fullname: string;
  id?: string;
};

export type AvatarSize = 'es' | 's' | 'm';
export type AvatarColor = (typeof AVATAR_COLORS)[number];

const OFFSET_HOVER_HEIGHT = 5;

const StdAvatar = ({ initials, size, backgroundColor, fullname, id: propsId }: StdAvatarProps) => {
  const avatarClasses = avatarClassBuilder(size, backgroundColor);
  const id = useStdId('avatar', propsId);

  return (
    <div role="figure" id={id} className={'avatar overflow-visible'}>
      <StdTextTooltip text={fullname} offset={OFFSET_HOVER_HEIGHT} placement="top">
        <p className={avatarClasses}>{initials}</p>
      </StdTextTooltip>
    </div>
  );
};

export default StdAvatar;
