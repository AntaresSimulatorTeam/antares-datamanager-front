/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { avatarCase } from '@/shared/utils/textUtils';
import { useUserDisplay } from '@/shared/hooks/useUserDisplay';
import { Avatar } from '@design-system-rte/react';

type UserDisplayCellProps = {
  nni: string;
};

export const UserDisplayCell = ({ nni }: UserDisplayCellProps) => {
  const { fullname, isLoading, error } = useUserDisplay(nni);

  if (isLoading) {
    return (
    <Avatar
      alt={fullname}
      colorType="decorative"
      decorativeColor="vert-foret"
      imgSrc=""
      initials=".."
      layout="initials"
      size={32}
      type="user"
    />
    );
  }

  const displayName = error ? nni : fullname;

  return (
    <Avatar
      alt={displayName}
      colorType="decorative"
      decorativeColor="vert-foret"
      imgSrc=""
      initials={avatarCase(displayName)}
      layout="initials"
      size={32}
      type="user"
    />
  );
};

export default UserDisplayCell;
