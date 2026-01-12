import { clsx } from 'clsx';

export const TAG_CLASSES = 'flex h-2.25 max-w-fit items-center rounded bg-gray-300';
export const UTILITY_CLASSES = 'std-tag';

export const tagClassBuilder = (isClosable?: boolean) =>
  clsx(TAG_CLASSES, UTILITY_CLASSES, isClosable ? 'pl-0.5' : 'px-0.5');
