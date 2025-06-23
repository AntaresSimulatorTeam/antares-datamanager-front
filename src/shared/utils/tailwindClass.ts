import { PseudoClass, TailwindColorClass, TailwindPrefix } from '@/shared/types';

export const buildColorClass = (prefix: TailwindPrefix, color: TailwindColorClass, pseudoClass?: PseudoClass) =>
  `${pseudoClass || ''}${prefix}-${color}`;
