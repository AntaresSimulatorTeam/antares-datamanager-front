/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const generatePaginationItems = (lastPage: number, currentPage: number): number[] => {
  const START_PAGE = 1;
  const MAX_VISIBLE_PAGES = 7;
  const MAX_PAGES_SEQUENCE = 5;
  const GAP_ITEM = -1;

  const items = [];

  if (lastPage <= MAX_VISIBLE_PAGES) for (let i = START_PAGE; i <= lastPage; i++) items.push(i);
  else {
    let pagesSequenceStart, pagesSequenceEnd;

    if (currentPage <= MAX_PAGES_SEQUENCE - 1) {
      pagesSequenceStart = START_PAGE;
      pagesSequenceEnd = MAX_PAGES_SEQUENCE;
    } else if (currentPage + MAX_PAGES_SEQUENCE - 1 >= lastPage + 1) {
      pagesSequenceStart = lastPage - MAX_PAGES_SEQUENCE + 1;
      pagesSequenceEnd = lastPage;
    } else {
      pagesSequenceStart = currentPage - 1;
      pagesSequenceEnd = currentPage + 1;
    }

    if (pagesSequenceStart > START_PAGE) {
      items.push(START_PAGE);
      if (pagesSequenceStart > START_PAGE + 1) items.push(GAP_ITEM);
    }

    for (let i = pagesSequenceStart; i <= pagesSequenceEnd; i++) items.push(i);

    if (pagesSequenceEnd < lastPage - 1) {
      if (pagesSequenceEnd + 1 < lastPage - 1) items.push(GAP_ITEM);
      items.push(lastPage);
    }
  }

  return items;
};
