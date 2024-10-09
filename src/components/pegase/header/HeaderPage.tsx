/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdDivider from '@/components/common/layout/stdDivider/StdDivider';
import { useTranslation } from 'react-i18next';

const HeaderPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex h-9 w-full items-center justify-between px-3 py-2">
        <span className="p-0.125 text-button-m">{t('Pegase.@pagesHeader')}</span>
      </div>
      <StdDivider />
    </>
  );
};

export default HeaderPage;
