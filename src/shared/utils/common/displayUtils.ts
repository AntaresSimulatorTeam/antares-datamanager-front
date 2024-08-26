/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject, RefObject } from 'react';
import { getDimensions } from './dom/getDimensions';

export const countMaxItemsToFitInContainer = (
  containerRef: RefObject<HTMLElement>,
  itemsRef: MutableRefObject<(HTMLElement | null)[]>,
  autoExpends: boolean,
): number => {
  if (autoExpends) {
    return itemsRef.current?.length ?? 0;
  }
  const gap = Number(containerRef.current?.computedStyleMap?.().get('gap')?.toString().replace('px', ''));
  const containerWidth = containerRef.current?.clientWidth ?? 0;
  const containerHeight = containerRef.current?.clientHeight ?? 0;

  const itemData = itemsRef.current?.reduce(
    (acc, itemRef) => {
      if (!itemRef) {
        return acc;
      }
      const itemDimension = getDimensions(itemRef);
      const itemWidth = itemDimension.width + gap;
      const currentLineWithItemWidth = acc.currentLineWidth + itemWidth;

      const itemFitInLine = currentLineWithItemWidth < containerWidth;
      if (itemFitInLine) {
        acc.numberOfItemDisplay += 1;
        acc.currentLineWidth = currentLineWithItemWidth;
        return acc;
      }

      const lineHeight = itemDimension.height + gap;
      const currentHeightWithNewLine = acc.currentLineHeight + lineHeight;
      const itemFitInNewLine = currentHeightWithNewLine < containerHeight;
      if (itemFitInNewLine) {
        acc.numberOfItemDisplay += 1;
        acc.currentLineWidth = itemWidth;
        acc.currentLineHeight = currentHeightWithNewLine;
        return acc;
      }
      acc.oversize = true;
      return acc;
    },
    { numberOfItemDisplay: 0, currentLineWidth: 0, currentLineHeight: 0, oversize: false },
  );

  return itemData.numberOfItemDisplay - (itemData.oversize ? 1 : 0);
};
