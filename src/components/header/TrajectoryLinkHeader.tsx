import { createColumnHelper } from '@tanstack/react-table';
import { TrajectoryLinkData } from '@/shared/types';

const columnHelperLink = createColumnHelper<TrajectoryLinkData>();

interface TypeNames {
  string: string;
  number: number;
}

export type Schema = keyof TypeNames | { [k: string]: Schema };

export const generateTrajectoryViewHeader = (schema: Schema, t: (value: string) => string, size: number) =>
  Object.keys(schema).map((value) =>
    columnHelperLink.accessor(value as unknown as keyof TrajectoryLinkData, {
      header: t(`trajectoryViewModal.@${value}`),
      size,
      cell: ({ getValue }) => <div className={'w-1/12'}>{getValue()}</div>,
    }),
  );
