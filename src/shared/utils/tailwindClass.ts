import { PseudoClass, TailwindPrefix } from '../types/Tailwind.type';
import { TailwindColorClass } from '@/shared/types';

export const buildColorClass = (prefix: TailwindPrefix, color: TailwindColorClass, pseudoClass?: PseudoClass) =>
  `${pseudoClass || ''}${prefix}-${color}`;
