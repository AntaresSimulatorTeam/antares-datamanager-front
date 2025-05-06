import { AreaAndLinkRowData } from '@/shared/types';

export const sortKeepLastName = (arr: AreaAndLinkRowData[], lastName: string): AreaAndLinkRowData[] =>
  arr.sort((a, b) => {
    if (a.hypothesis === lastName) return 1;
    if (b.hypothesis === lastName) return -1;
    return a.hypothesis.localeCompare(b.hypothesis, 'en', { ignorePunctuation: true });
  });
