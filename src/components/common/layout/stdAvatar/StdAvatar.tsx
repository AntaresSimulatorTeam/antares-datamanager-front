/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { avatarClassBuilder } from './avatarClassBuilder';
import { AVATAR_COLORS } from '../stdAvatarGroup/avatarTools';
import { RdsTextTooltip, useRdsId } from 'rte-design-system-react';

export type AvatarSize = 'es' | 's' | 'm';
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export type AvatarTextColor = 'black' | 'white';

type StdAvatarProps = {
  initials: string;
  size: AvatarSize;
  backgroundColor: AvatarColor;
  fullname: string;
  id?: string;
  textColor?: AvatarTextColor;
  hasToolTip?: boolean;
};

const OFFSET_HOVER_HEIGHT = 5;

const StdAvatar = ({
  initials,
  size,
  backgroundColor,
  fullname,
  id: propsId,
  textColor,
  hasToolTip = true,
}: StdAvatarProps) => {
  const avatarClasses = avatarClassBuilder(size, backgroundColor, textColor);
  const id = useRdsId('avatar', propsId);

  return hasToolTip ? (
    <div role="figure" id={id} className={'avatar overflow-visible'}>
      <RdsTextTooltip text={fullname} offset={OFFSET_HOVER_HEIGHT} placement="top">
        <p className={avatarClasses}>{initials}</p>
      </RdsTextTooltip>
    </div>
  ) : (
    <div role="figure" id={id} className={'avatar overflow-visible'}>
      <p className={avatarClasses}>{initials}</p>
    </div>
  );
};

export default StdAvatar;
