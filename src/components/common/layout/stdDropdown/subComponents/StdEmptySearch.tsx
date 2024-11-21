/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StdIconId } from '@/shared/utils/common/mappings/iconMaps';
import StdIcon from '@common/base/stdIcon/StdIcon';
import { useTranslation } from 'react-i18next';

const ICON_SIZE = 16;
export const EMPTY_SEARCH_ID = 'empty-search';
const StdEmptySearch = () => {
  const { t } = useTranslation();
  return (
    <div id={EMPTY_SEARCH_ID} className="flex w-full gap-1 px-1">
      <StdIcon color="gray-600" name={StdIconId.Search} height={ICON_SIZE} width={ICON_SIZE} />
      <p className="text-pretty text-caption text-gray-700">{t('components.search.@empty')}</p>
    </div>
  );
};

export default StdEmptySearch;
