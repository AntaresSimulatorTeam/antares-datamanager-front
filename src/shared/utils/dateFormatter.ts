/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const standardDateFormatter = (date: Date, locale: string) =>
  date.toLocaleTimeString(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

export const formatDateToDDMMYYYY = (dateInput: Date | string, includeTime: boolean = false): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  console.log('================ date', date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (!includeTime) {
    return `${year}-${month}-${day}`;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
