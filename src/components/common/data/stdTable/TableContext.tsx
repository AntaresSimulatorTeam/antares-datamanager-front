/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Table } from '@tanstack/react-table';
import { createContext } from 'react';

export type TableContextType<TData> = {
  table: Table<TData> | undefined;
};
const createTableContext = <TData,>() => createContext<TableContextType<TData>>({ table: undefined });

export const TableContext = createTableContext();
