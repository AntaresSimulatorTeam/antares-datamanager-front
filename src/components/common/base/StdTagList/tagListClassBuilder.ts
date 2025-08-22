import { clsx } from 'clsx';

export const COMMON_TAG_LIST_CLASSES = 'flex w-full items-center flex-wrap gap-1';

export const tagListClassBuilder = (isReady: boolean, singleLine: boolean) => ({
  tagListClasses: clsx(
    COMMON_TAG_LIST_CLASSES,
    !isReady && 'invisible',
    singleLine ? 'h-3 overflow-y-hidden' : 'h-full',
  ),
});
