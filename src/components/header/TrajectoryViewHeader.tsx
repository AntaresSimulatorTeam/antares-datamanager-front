import { createColumnHelper } from '@tanstack/react-table';
import { TRAJECTORY_DATA_TYPE, Types } from '@/shared/types';
// @ts-ignore
import { AccessorKeyColumnDef } from '@tanstack/table-core/src/types.ts';

const columnHelperLink = createColumnHelper<Types<TRAJECTORY_DATA_TYPE>>();

interface TypeNames {
  string: string;
  number: number;
}

export type Schema = keyof TypeNames | { [k: string]: Schema };

export const generateTrajectoryViewHeader = (
  schema: Schema,
  t: (value: string) => string,
  size: number,
): AccessorKeyColumnDef<Types<TRAJECTORY_DATA_TYPE>>[] =>
  Object.keys(schema).map((value) =>
    columnHelperLink.accessor(value as keyof Types<TRAJECTORY_DATA_TYPE>, {
      header: t(`trajectoryViewModal.@${value}`),
      size,
      cell: ({ getValue }) => <span>{getValue() as string | number}</span>,
    }),
  );
