/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { avatarClassBuilder } from './avatarClassBuilder';
import { AVATAR_COLORS } from '../stdAvatarGroup/avatarTools';
import { RdsTextTooltip, useRdsId } from 'rte-design-system-react';

type StdAvatarProps = {
  initials: string;
  size: AvatarSize;
  backgroundColor: AvatarColor;
  fullname: string;
  id?: string;
  textColor?: AvatarTextColor;
};

export type AvatarSize = 'es' | 's' | 'm';
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export type AvatarTextColor = 'black' | 'white';

const OFFSET_HOVER_HEIGHT = 5;

const StdAvatar = ({ initials, size, backgroundColor, fullname, id: propsId, textColor }: StdAvatarProps) => {
  const avatarClasses = avatarClassBuilder(size, backgroundColor, textColor);
  const id = useRdsId('avatar', propsId);

  return (
    <div role="figure" id={id} className={'avatar overflow-visible'}>
      <RdsTextTooltip text={fullname} offset={OFFSET_HOVER_HEIGHT} placement="top">
        <p className={avatarClasses}>{initials}</p>
      </RdsTextTooltip>
    </div>
  );
};

export default StdAvatar;
