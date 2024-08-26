/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type HeaderCommon = {
  key: string;
  label: React.ReactNode;
  width?: string;
};
type FormatHeaderConfig<T> = HeaderCommon & {
  formatter: (row: T, key: string) => React.ReactNode;
};

type KeyHeaderConfig<T extends Record<string, React.ReactNode>> = HeaderCommon & {
  dataKey: keyof T;
};

type ExtractOnlyReactNodeKey<T> = T[keyof T] extends React.ReactNode ? keyof T : never;
type KeyToReactNodeType<T> = Record<ExtractOnlyReactNodeKey<T>, React.ReactNode>;

export type HeaderConfig<T> =
  T extends KeyToReactNodeType<T> ? KeyHeaderConfig<T> | FormatHeaderConfig<T> : FormatHeaderConfig<T>;

export type CollapsibleRow<T> = {
  key: string;
  data: T;
  collapsible: true;
  defaultOpen?: boolean;
  childRows: RowData<T>[];
};
export type StraightRow<T> = {
  key: string;
  data: T;
  collapsible?: false;
};

export type RowData<T> = CollapsibleRow<T> | StraightRow<T>;
