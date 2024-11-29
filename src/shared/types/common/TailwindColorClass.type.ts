/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// with help from https://stackoverflow.com/a/66661477

import tailwindConfig from 'tailwind.config';

type DeepKeyOf<T> = (
  [T] extends [never]
    ? ''
    : T extends object
      ? {
          [K in Exclude<keyof T, symbol>]: `${K}${undefined extends T[K] ? '?' : ''}${DotPrefix<DeepKeyOf<T[K]>>}`;
        }[Exclude<keyof T, symbol>]
      : ''
) extends infer D
  ? Extract<D, string>
  : never;

type DotPrefix<T extends string> = T extends '' ? '' : `-${T}`;

type ColorsObject = typeof tailwindConfig.theme.colors;
export type TailwindColorClass = DeepKeyOf<ColorsObject>;

type RecObject =
  | {
      [key: string]: RecObject;
    }
  | string;

const getAllColorPaths = (obj: RecObject, prefix: string): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const newPrefix = prefix ? `${prefix}-${key}` : key;
    if (typeof value === 'object' && value !== null) {
      return getAllColorPaths(value, newPrefix);
    } else {
      return [newPrefix];
    }
  });

export const TailwindColors = getAllColorPaths(tailwindConfig.theme.colors, 'text');
