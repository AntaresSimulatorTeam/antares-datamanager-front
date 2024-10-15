/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdButton from '@/components/common/base/stdButton/StdButton';
import StdDivider from '@/components/common/layout/stdDivider/StdDivider';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useContext } from 'react';
import { UserContext } from '@/contexts/UserContext';
import { AuthService } from '@/auth/authService';

const Header: React.FC = () => {
  const user = useContext(UserContext);
  const { t } = useTranslation();

  return (
    <>
      <div className="flex h-9 w-full items-center justify-between px-3 py-2">
        <span className="p-0.125 text-button-m">
          {t('Pegase.@homePageHeader')}
          <strong>{user?.profile.name} </strong>
        </span>
        <StdButton label="Se Déconnecter" icon={StdIconId.Logout} onClick={AuthService.logout} />
      </div>
      <StdDivider />
    </>
  );
};

export default Header;
