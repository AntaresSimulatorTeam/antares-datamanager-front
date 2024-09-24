/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { User } from '@/shared/types/common/User.type';
import StdAvatar from '../stdAvatar/StdAvatar';
import { AvatarSize } from '../stdAvatar/StdAvatar';
import { classBuilder as groupContainerClassBuilder } from './avatarGroupClassBuilder';
import { getColor, getUserFullname, getUserInitials, splitUserList } from './avatarTools';
import { useStdId } from '@/hooks/common/useStdId';

type StdAvatarGroup = {
  users: User[];
  avatarSize?: AvatarSize;
  id?: string;
};

const StdAvatarGroup = ({ users: listUser, avatarSize = 'es', id: propsId }: StdAvatarGroup) => {
  const groupContainerClasses = groupContainerClassBuilder(avatarSize);
  const users = splitUserList(listUser);

  const id = useStdId('avatarGroup', propsId);

  return (
    <div role="group" id={id} className={groupContainerClasses}>
      {users.map((user) => (
        <StdAvatar
          key={getUserFullname(user)}
          initials={getUserInitials(user)}
          size={avatarSize}
          backgroundColor={getColor(user)}
          fullname={getUserFullname(user)}
        />
      ))}
    </div>
  );
};

export default StdAvatarGroup;
