import { clsx } from 'clsx';

export const DIVIDER_COMMON_CLASSES = 'border-t-1 w-full border-gray-300';

export const dividerClassBuilder = (extraClasses?: string) =>
  extraClasses ? clsx(DIVIDER_COMMON_CLASSES, extraClasses) : DIVIDER_COMMON_CLASSES;
