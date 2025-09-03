import { useCallOnResize } from '@/hooks/useCallOnResize';
import { getDimensions } from '@/shared/utils/dom/getDimensions';
import { RefObject, useLayoutEffect, useState } from 'react';

const getSimpleDimensions = (el: HTMLElement | null) => {
  if (!el) {
    return { height: 0, width: 0 };
  }
  const wantedHeight = { height: el.offsetHeight, width: el.offsetWidth };
  return wantedHeight;
};

const TAGS_DIMENSION_CACHE = new Map<string, Dimension>();
let PLUS_TAG_DIMENSION_CACHE: Dimension | null = null;
const GAP_SIZE = 8;

const getCachedTagDimensions = (tag: string, tagElement: HTMLElement | null) => {
  const dims = TAGS_DIMENSION_CACHE.get(tag);
  if (dims) {
    return dims;
  }
  if (tagElement && !TAGS_DIMENSION_CACHE.has(tag)) {
    const calcDims = getSimpleDimensions(tagElement);
    if (calcDims.height !== 0 && calcDims.width !== 0) {
      TAGS_DIMENSION_CACHE.set(tag, calcDims);
    }
    return calcDims;
  }
  return { width: 0, height: 0 };
};

const getCachedPlusTagDimensions = (tagElement: HTMLElement | null) => {
  if (PLUS_TAG_DIMENSION_CACHE) {
    return PLUS_TAG_DIMENSION_CACHE;
  }
  if (tagElement && !PLUS_TAG_DIMENSION_CACHE) {
    const calcDims = getDimensions(tagElement);
    if (calcDims.height !== 0 && calcDims.width !== 0) {
      PLUS_TAG_DIMENSION_CACHE = calcDims;
      return calcDims;
    }
  }
  return { width: 0, height: 0 };
};

export type CountMaxTagsToFitInContainerProps = {
  containerRef: RefObject<HTMLElement | null>;
  tagsRef: RefObject<(HTMLSpanElement | null)[]>;
  plusTagRef: RefObject<HTMLSpanElement | null>;
  autoExpands: boolean;
  singleLine?: boolean;
  maxVisibleTags?: number;
  tags: string[];
  startReady: boolean;
};
type Dimension = { width: number; height: number };

const countMaxTagsToFitInContainer = ({
  containerWidth,
  containerHeight,
  autoExpands,
  maxVisibleTags,
  tagsRef,
  plusTagRef,
  singleLine,
  tags,
}: {
  tags: string[];
  containerWidth: number;
  containerHeight: number;
  autoExpands: boolean;
  maxVisibleTags?: number;
  tagsRef: RefObject<(HTMLSpanElement | null)[]>;
  plusTagRef: RefObject<HTMLSpanElement | null>;
  singleLine?: boolean;
}) => {
  const getTagsDims = (i: number) => getCachedTagDimensions(tags[i], tagsRef?.current?.[i] ?? null);
  if (autoExpands) {
    return tagsRef.current?.length ?? 0;
  }
  let tagsCount = tagsRef.current?.length;
  if (maxVisibleTags && tagsCount != null) {
    tagsCount = Math.min(tagsCount, maxVisibleTags);
  }

  const plusTagSize = getCachedPlusTagDimensions(plusTagRef.current);
  let currentTagIdx = 0;
  const tagHeight = getTagsDims(0)?.height ?? 0;
  let currentContentHeight = tagHeight;
  let currentLineWidth = 0;

  // First pass: Find max tags that fit without plusTag
  while (tagsCount != null && currentTagIdx < tagsCount) {
    const { width } = getTagsDims(currentTagIdx);
    const gapWidth = currentTagIdx > 0 ? GAP_SIZE : 0;
    const currentLineWidthWithTag = currentLineWidth + gapWidth + width;

    // Check width constraints
    if (currentLineWidthWithTag <= containerWidth) {
      currentLineWidth = currentLineWidthWithTag;
      currentTagIdx += 1;
    }
    // Check height constraints for multiline
    else if (!singleLine && currentContentHeight + GAP_SIZE + tagHeight <= containerHeight && width <= containerWidth) {
      currentContentHeight += GAP_SIZE + tagHeight;
      currentLineWidth = width;
      currentTagIdx += 1;
    }
    // overflow
    else {
      break;
    }
  }

  // Backtrack to ensure plusTag fits
  while (currentTagIdx > 0) {
    const { width } = getTagsDims(currentTagIdx - 1);
    const lineWidthWithPlusTag = currentLineWidth + GAP_SIZE + plusTagSize.width;

    if (lineWidthWithPlusTag < containerWidth) {
      return currentTagIdx;
    }

    currentLineWidth -= width + GAP_SIZE;
    currentTagIdx -= 1;
  }

  return 0;
};

export const useCountMaxTagsToFitInContainer = ({
  containerRef,
  tagsRef,
  plusTagRef,
  autoExpands,
  singleLine = false,
  maxVisibleTags,
  tags,
  startReady,
}: CountMaxTagsToFitInContainerProps) => {
  const [tagsNumber, setTagsNumber] = useState<number>(tags?.length ?? 0);
  const [isReady, setIsReady] = useState<boolean>(startReady);

  useLayoutEffect(() => {
    if (!tagsRef.current || !plusTagRef.current) {
      return;
    }
    tagsRef.current.forEach((item, index) => {
      if (!item) {
        return;
      }
      const tag = tags[index];
      getCachedTagDimensions(tag, item);
    });

    getCachedPlusTagDimensions(plusTagRef.current);
  }, [plusTagRef, tags, tagsRef]);

  useCallOnResize(
    () => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const containerHeight = containerRef.current?.clientHeight ?? 0;
      const res = countMaxTagsToFitInContainer({
        containerWidth,
        containerHeight,
        autoExpands,
        maxVisibleTags,
        tagsRef,
        plusTagRef,
        singleLine,
        tags,
      });
      setTagsNumber(res);
      setIsReady(true);
    },
    { elementRef: containerRef, debounceTime: 100 },
  );

  return { tagsNumber, isReady };
};
