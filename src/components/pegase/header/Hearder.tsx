/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import StdButton from '@/components/common/base/stdButton/StdButton';
import StdDivider from '@/components/common/layout/stdDivider/StdDivider';
import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import { useTranslation } from 'react-i18next';

const Hearder = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex h-9 w-full items-center justify-between px-3 py-2">
        <span className="p-0.125 text-button-m">{t('Pegase.@homePageHeader')}</span>

        <StdButton label="create" icon={StdIconId.Add} variant="contained" />
      </div>
      <StdDivider />
    </>
  );
};

export default Hearder;
