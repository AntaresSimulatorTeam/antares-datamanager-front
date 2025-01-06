/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
export type ReadOnlyObject = Record<string, boolean>;
export interface ReadOnlyTableState {
  readOnly: ReadOnlyObject;
}

export interface ReadOnlyOptions {}

// Define types for our new feature's table APIs
export interface ReadOnlyTableInstance {
  setReadOnly: (updater: Updater<ReadOnlyObject>) => void;
}

export interface ReadOnlyRow {
  setReadOnly: (updater: Updater<boolean>) => void;
  getReadOnly: () => boolean;
}

declare module '@tanstack/react-table' {
  interface TableState extends ReadOnlyTableState {}
  interface TableOptionsResolved<TData extends RowData> extends ReadOnlyOptions {}
  interface Table<TData extends RowData> extends ReadOnlyTableInstance {}
  interface Row<TData extends RowData> extends ReadOnlyRow {}
}
