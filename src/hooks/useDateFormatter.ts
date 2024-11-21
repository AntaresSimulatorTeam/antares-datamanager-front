/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { standardDateFormatter } from '@/shared/utils/dateFormatter';

export const useDateFormatter = () => {
  const { t, i18n } = useTranslation();

  const formatDateToLocale = useCallback((date: Date) => standardDateFormatter(date, i18n.language), [i18n.language]);

  const formatRelativeDate = useCallback(
    (date: Date) => {
      const now = new Date();
      const difference = now.getTime() - date.getTime();
      const minutesAgo = Math.floor(difference / (1000 * 60));
      const hoursAgo = Math.floor(difference / (1000 * 60 * 60));
      const daysAgo = Math.floor(difference / (1000 * 60 * 60 * 24));
      const monthsAgo = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
      const yearsAgo = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));

      if (minutesAgo < 1) return t('components.relativeDate.@justNow');
      if (hoursAgo < 1) return t('components.relativeDate.@minutes', { count: minutesAgo });
      if (daysAgo < 1) return t('components.relativeDate.@hours', { count: hoursAgo });
      if (monthsAgo < 1) return t('components.relativeDate.@days', { count: daysAgo });
      if (yearsAgo < 1) return t('components.relativeDate.@months', { count: monthsAgo });

      return t('components.relativeDate.@years', { count: yearsAgo });
    },
    [t],
  );

  return { formatDateToLocale, formatRelativeDate };
};
