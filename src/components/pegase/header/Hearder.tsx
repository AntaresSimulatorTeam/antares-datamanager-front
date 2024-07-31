/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdDivider from '@/components/common/layout/stdDivider/StdDivider';
import { useTranslation } from 'react-i18next';

const Hearder = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <h1>{t('Pegase.@homePageHeader')}</h1>
      <StdDivider />
    </div>
  );
};

export default Hearder;
