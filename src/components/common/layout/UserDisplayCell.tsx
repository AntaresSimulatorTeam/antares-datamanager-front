/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdAvatar from '@/components/common/layout/stdAvatar/StdAvatar';
import { avatarCase } from '@/shared/utils/textUtils';
import { useUserDisplay } from '@/shared/hooks/useUserDisplay';

type UserDisplayCellProps = {
  nni: string;
};

export const UserDisplayCell = ({ nni }: UserDisplayCellProps) => {
  const { fullname, isLoading, error } = useUserDisplay(nni);

  if (isLoading) {
    return (
      <StdAvatar
        size="es"
        backgroundColor="gray"
        fullname="..."
        initials="..."
      />
    );
  }

  const displayName = error ? nni : fullname;

  return (
    <StdAvatar
      size="es"
      backgroundColor="gray"
      fullname={displayName}
      initials={avatarCase(displayName)}
      title={error ? `Error: ${error}` : displayName}
    />
  );
};

export default UserDisplayCell;
