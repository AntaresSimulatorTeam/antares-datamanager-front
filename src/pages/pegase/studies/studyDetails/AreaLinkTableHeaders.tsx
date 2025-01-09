/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { RdsButton } from 'rte-design-system-react';

const columnHelper = createColumnHelper<any>();

const getAreaLinkTableHeaders = () => {
  const { t } = useTranslation();
  return [
    columnHelper.accessor('hypothesis', {
      header: t('home.@hypothesis'),
    }),

    columnHelper.accessor('trajectroy', {
      header: t('home.@trajectory'),
      cell: () => <RdsButton label="import" />,
    }),

    columnHelper.accessor('status', {
      header: t('home.@status'),
    }),
  ];
};

export default getAreaLinkTableHeaders;
