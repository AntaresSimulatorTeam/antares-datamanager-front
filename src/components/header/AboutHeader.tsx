// @ts-ignore
import { AccessorKeyColumnDef } from '@tanstack/table-core/src/types.ts';
import { AppData } from '@/shared/types/AppInfo.ts';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelperAbout = createColumnHelper<AppData>();

export const AboutHeaders = (t: (value: string) => string): AccessorKeyColumnDef<AppData>[] => [
  columnHelperAbout.accessor('info', {
    header: t('about.@information'),
    cell: ({ getValue }) => <span>{getValue() ? t(`about.@${getValue()}`) : ''}</span>,
  }),
  columnHelperAbout.accessor('back', {
    header: t('about.@backend'),
    cell: ({ getValue }) => <span>{getValue() as string | number}</span>,
  }),
  columnHelperAbout.accessor('front', {
    header: t('about.@frontend'),
    cell: ({ getValue }) => <span>{getValue() as string | number}</span>,
  }),
];
