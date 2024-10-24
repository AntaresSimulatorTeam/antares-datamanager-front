/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdButton from '@/components/common/base/stdButton/StdButton';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="inline-flex h-[160px] items-start justify-start rounded-lg p-8">
        <div className="bg-white justify- flex items-center rounded-sm border border-dashed border-[#c0d466] px-4 py-7">
          <StdButton label={t('home.@buttonNewProject')} variant="contained" color="primary" />
        </div>
      </div>
    </>
  );
};

export default Header;
